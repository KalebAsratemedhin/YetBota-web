"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import LocationDetailsHeader from "@/components/locations/LocationDetailsHeader";
import LocationHero from "@/components/locations/LocationHero";
import LocationPost from "@/components/locations/LocationPost";
import LocationComments from "@/components/locations/LocationComments";
import LocationAttachedQa from "@/components/locations/LocationAttachedQa";
import SimilarPlacesGrid from "@/components/locations/SimilarPlacesGrid";
import LocationRightRail from "@/components/locations/LocationRightRail";
import MobileBottomNav from "@/components/locations/MobileBottomNav";
import { getLocationDetails } from "@/lib/locationDetailsMockData";
import { useAppSelector } from "@/store/hooks";
import { useFollowUserMutation, useGetMeQuery, useGetUserByIdQuery, useUnfollowUserMutation } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import {
  useGetFeedQuery,
  useGetPostByIdQuery,
  useListCommentsQuery,
  useListPostsQuery,
  useSavePostMutation,
  useUnsavePostMutation,
  useVotePostMutation,
} from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";

const SIMILAR_LIMIT = 6;

function approxTimeLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 6) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export default function LocationDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const data = getLocationDetails(id);

  const { data: postRes, isLoading: postLoading, isError: postError, refetch: refetchPost } = useGetPostByIdQuery(
    { id, resolution: "WEB" }
  );
  const post = postRes?.post;

  const { data: authorRes } = useGetUserByIdQuery(
    { id: post?.user_id ?? "", resolution: "WEB" },
    { skip: !accessToken || !post?.user_id }
  );

  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const { toast } = useToast();
  const currentUserAvatarUrl = me?.user?.profile_url ? resolveApiUrl(me.user.profile_url) : data.currentUserAvatarUrl;
  const [activeTab, setActiveTab] = useState<"comments" | "qa">("comments");

  // The current user's own vote state comes from post details (post.interaction)
  // — the single source of truth.
  // `undefined` = user hasn't voted this session, so defer to the server value.
  const [voteOverride, setVoteOverride] = useState<"like" | "dislike" | null | undefined>(undefined);
  const myVote: "like" | "dislike" | null =
    voteOverride !== undefined ? voteOverride : post?.interaction ?? null;
  const [votePost, { isLoading: voting }] = useVotePostMutation();
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();
  // Bookmark state — post details (post.saved) is the source of truth; the
  // override only applies while a save/unsave request is in flight.
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [savePost, { isLoading: saving }] = useSavePostMutation();
  const [unsavePost, { isLoading: unsaving }] = useUnsavePostMutation();
  const isSaved = savedOverride ?? post?.saved ?? false;

  // "Similar Places" pulls from the personalized feed (auth-only); drop the
  // post we're already viewing and cap the grid.
  const { data: feedRes, isLoading: feedLoading } = useGetFeedQuery(
    { page_size: SIMILAR_LIMIT + 1 },
    { skip: !accessToken }
  );
  const similarPosts = (feedRes?.posts ?? []).filter((p) => p.id !== id).slice(0, SIMILAR_LIMIT);

  const {
    data: commentsRes,
    refetch: refetchComments,
  } = useListCommentsQuery({ post_id: id }, { skip: !accessToken || !id });
  const commentCount = (commentsRes?.comments ?? []).filter((c) => !c.comment_id && !c.is_answer).length;

  // Community Q&A — questions attached to this post (GET /v1/posts/ filtered to
  // questions whose attached_post_id is this post). Public/optional-auth.
  const {
    data: attachedQaRes,
    isLoading: qaLoading,
    isError: qaError,
  } = useListPostsQuery(
    {
      is_question: true,
      attached_post_id: id,
      page: 1,
      page_size: 6,
      sort_by: "created_at",
      sort_dir: "desc",
      resolution: "WEB",
    },
    { skip: !id }
  );
  const attachedQuestions = attachedQaRes?.posts ?? [];
  const qaCount =
    typeof attachedQaRes?.total === "number" ? attachedQaRes.total : attachedQuestions.length;

  const heroTitle = post?.title ?? data.title;
  const heroImageUrl = post?.photos?.[0]?.photo_url ?? data.heroImageUrl;

  const authorName =
    authorRes?.user ? `${authorRes.user.first_name} ${authorRes.user.last_name}`.trim() : data.author.name;
  const authorAvatarUrl = authorRes?.user?.profile_url ? resolveApiUrl(authorRes.user.profile_url) : data.author.avatarUrl;
  const authorMeta = post?.created_at
    ? `${approxTimeLabel(post.created_at)} • ${data.author.meta.split("•")[1]?.trim() ?? ""}`
    : data.author.meta;

  const postBody = post?.description ?? data.body;
  const postTags = post?.tags?.length ? post.tags : data.tags;
  const likes = typeof post?.likes === "number" ? post.likes : data.likes;
  const dislikes = typeof post?.dislikes === "number" ? post.dislikes : 0;
  const comments = typeof post?.comments === "number" ? post.comments : data.comments;

  const loc = post?.location ?? data.location;
  const addressLine = post?.address && post.address.trim().length > 0
    ? post.address
    : typeof loc?.latitude === "number" && typeof loc?.longitude === "number"
      ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      : data.rightRail.addressLine;

  const meId = me?.user?.id;
  const authorId = post?.user_id;
  const canFollow = Boolean(meId && authorId && meId !== authorId);
  // Post details (post.following_author) is the source of truth; the override
  // only applies while a follow/unfollow request is in flight.
  const isFollowing = followOverride ?? post?.following_author ?? false;
  const followBusy = followLoading || unfollowLoading;

  async function handleToggleFollow() {
    if (!meId || !authorId || meId === authorId) return;
    const next = !isFollowing;
    try {
      setFollowOverride(next);
      if (next) {
        await followUser({ followee_id: authorId }).unwrap();
      } else {
        await unfollowUser({ followee_id: authorId }).unwrap();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: getAuthErrorMessage(err) });
      // Roll back to the server's value.
      setFollowOverride(null);
    }
  }

  async function handleToggleSave() {
    if (!post?.id) return;
    const next = !isSaved;
    try {
      setSavedOverride(next);
      if (next) {
        await savePost({ id: post.id }).unwrap();
      } else {
        await unsavePost({ id: post.id }).unwrap();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: getAuthErrorMessage(err) });
      // Roll back to the server's value.
      setSavedOverride(null);
    }
  }

  async function handleVote(next: "like" | "dislike") {
    if (!post?.id) return;
    try {
      setVoteOverride(next);
      await votePost({ id: post.id, body: { vote_type: next } }).unwrap();
      // Update counts via refetch (single source of truth).
      void refetchPost();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to vote", description: getAuthErrorMessage(err) });
      // Roll back to the server's value.
      setVoteOverride(undefined);
    }
  }

  return (
    <div className="bg-bg text-fg min-h-screen">
      <LocationDetailsHeader
        title={heroTitle}
        saved={isSaved}
        onToggleSave={accessToken ? () => void handleToggleSave() : undefined}
        saveLoading={saving || unsaving}
        reportContentId={post?.id}
        canReport={Boolean(me?.user?.id && post?.user_id && me.user.id !== post.user_id)}
      />
      <div className="flex max-w-[1440px] mx-auto min-h-screen relative">
        <main className="w-full lg:max-w-4xl lg:mx-auto min-h-screen">
          {postLoading ? (
            <div className="p-6 text-fg-faint text-sm">Loading…</div>
          ) : postError || !post ? (
            <>
              <LocationHero title={data.title} imageUrl={data.heroImageUrl} />
              <div className="px-6 pb-6 text-fg-faint text-sm">
                Failed to load this location post.{" "}
                <button type="button" className="text-brand font-semibold" onClick={() => void refetchPost()}>
                  Retry
                </button>
              </div>
            </>
          ) : (
            <>
              <LocationHero title={heroTitle} imageUrl={heroImageUrl} />
              <LocationPost
                author={{
                  id: post?.user_id,
                  name: authorName,
                  avatarUrl: authorAvatarUrl,
                  badge: data.author.badge,
                  meta: authorMeta,
                }}
                title={heroTitle}
                body={postBody}
                tags={postTags}
                likes={likes}
                dislikes={dislikes}
                comments={commentCount || comments}
                qaCount={qaCount}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showFollow={canFollow}
                following={isFollowing}
                followLoading={followBusy}
                onToggleFollow={() => void handleToggleFollow()}
                vote={myVote}
                onVote={(next) => void handleVote(next)}
                voting={voting}
                canVote={Boolean(me?.user?.id && post?.user_id && me.user.id !== post.user_id)}
                saved={isSaved}
                onToggleSave={() => void handleToggleSave()}
                saveLoading={saving || unsaving}
              />
            </>
          )}
          {activeTab === "comments" ? (
            <div id="comments">
              <LocationComments
                postId={id}
                currentUserAvatarUrl={currentUserAvatarUrl}
                currentUserId={me?.user?.id}
                onCommentPosted={() => {
                  void refetchPost();
                  void refetchComments();
                }}
              />
            </div>
          ) : (
            <div id="community-qa">
              <LocationAttachedQa posts={attachedQuestions} loading={qaLoading} error={qaError} />
            </div>
          )}
          <SimilarPlacesGrid posts={similarPosts} loading={Boolean(accessToken) && feedLoading} />
        </main>

        <LocationRightRail
          addressLine={addressLine}
          guides={data.rightRail.guides}
          location={loc}
        />
      </div>

      <MobileBottomNav />
    </div>
  );
}

