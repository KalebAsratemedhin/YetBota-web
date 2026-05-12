"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import LocationDetailsHeader from "@/components/locations/LocationDetailsHeader";
import LocationHero from "@/components/locations/LocationHero";
import LocationPost from "@/components/locations/LocationPost";
import LocationComments from "@/components/locations/LocationComments";
import LocationCommunityQaMini from "@/components/locations/LocationCommunityQaMini";
import SimilarPlacesGrid from "@/components/locations/SimilarPlacesGrid";
import LocationRightRail from "@/components/locations/LocationRightRail";
import MobileBottomNav from "@/components/locations/MobileBottomNav";
import { getLocationDetails } from "@/lib/locationDetailsMockData";
import { useAppSelector } from "@/store/hooks";
import { useFollowUserMutation, useGetMeQuery, useGetUserByIdQuery, useUnfollowUserMutation } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { useGetPostByIdQuery, useListCommentsQuery, useVotePostMutation } from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";

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

function voteStorageKey(postId: string) {
  return `yetbota.postVote.${postId}`;
}

function readStoredVote(postId: string): "like" | "dislike" | null {
  if (!postId) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(voteStorageKey(postId));
    if (raw === "like" || raw === "dislike") return raw;
    return null;
  } catch {
    return null;
  }
}

function writeStoredVote(postId: string, vote: "like" | "dislike") {
  if (!postId) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(voteStorageKey(postId), vote);
  } catch {
    // ignore
  }
}

function followStorageKey(meId: string, followeeId: string) {
  return `yetbota.following.${meId}.${followeeId}`;
}

function readStoredFollowing(meId?: string, followeeId?: string): boolean | null {
  if (!meId || !followeeId) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(followStorageKey(meId, followeeId));
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function writeStoredFollowing(meId: string, followeeId: string, following: boolean) {
  if (!meId || !followeeId) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(followStorageKey(meId, followeeId), following ? "true" : "false");
  } catch {
    // ignore
  }
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
  const [myVote, setMyVote] = useState<"like" | "dislike" | null>(() => readStoredVote(id));
  const [votePost, { isLoading: voting }] = useVotePostMutation();
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();

  const {
    data: commentsRes,
    refetch: refetchComments,
  } = useListCommentsQuery({ post_id: id }, { skip: !accessToken || !id });
  const commentCount = (commentsRes?.comments ?? []).filter((c) => !c.comment_id && !c.is_answer).length;
  const qaCount = (commentsRes?.comments ?? []).filter((c) => !c.comment_id && c.is_answer).length;

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
  const storedFollowing = readStoredFollowing(meId, authorId);
  const isFollowing = followOverride ?? storedFollowing ?? false;
  const followBusy = followLoading || unfollowLoading;

  async function handleToggleFollow() {
    if (!meId || !authorId || meId === authorId) return;
    try {
      const next = !isFollowing;
      setFollowOverride(next);
      writeStoredFollowing(meId, authorId, next);

      if (next) {
        await followUser({ followee_id: authorId }).unwrap();
      } else {
        await unfollowUser({ followee_id: authorId }).unwrap();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: getAuthErrorMessage(err) });
      const fallback = readStoredFollowing(meId, authorId);
      setFollowOverride(fallback ?? false);
    }
  }

  async function handleVote(next: "like" | "dislike") {
    if (!post?.id) return;
    try {
      setMyVote(next);
      writeStoredVote(post.id, next);
      await votePost({ id: post.id, body: { vote_type: next } }).unwrap();
      // Update counts via refetch (single source of truth).
      void refetchPost();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to vote", description: getAuthErrorMessage(err) });
      const fallback = readStoredVote(post.id);
      setMyVote(fallback);
    }
  }

  return (
    <div className="bg-bg text-fg min-h-screen">
      <LocationDetailsHeader />
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
              <LocationCommunityQaMini items={data.qa} />
            </div>
          )}
          <SimilarPlacesGrid places={data.similarPlaces} />
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

