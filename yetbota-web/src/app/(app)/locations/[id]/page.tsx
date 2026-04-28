"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import LocationDetailsHeader from "@/components/locations/LocationDetailsHeader";
import LocationHero from "@/components/locations/LocationHero";
import LocationPost from "@/components/locations/LocationPost";
import LocationCommunityQa from "@/components/locations/LocationCommunityQa";
import SimilarPlacesGrid from "@/components/locations/SimilarPlacesGrid";
import LocationRightRail from "@/components/locations/LocationRightRail";
import MobileBottomNav from "@/components/locations/MobileBottomNav";
import { getLocationDetails } from "@/lib/locationDetailsMockData";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery, useGetUserByIdQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { useGetPostByIdQuery } from "@/store/api/contentApi";

export default function LocationDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const data = getLocationDetails(id);

  const { data: postRes, isLoading: postLoading, isError: postError, refetch: refetchPost } = useGetPostByIdQuery(
    { id, resolution: "WEB" },
    { skip: !accessToken }
  );
  const post = postRes?.post;

  const { data: authorRes } = useGetUserByIdQuery(
    { id: post?.user_id ?? "", resolution: "WEB" },
    { skip: !accessToken || !post?.user_id }
  );

  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const currentUserAvatarUrl = me?.user?.profile_url ? resolveApiUrl(me.user.profile_url) : data.currentUserAvatarUrl;
  const [commentsOpen, setCommentsOpen] = useState(true);

  const heroTitle = post?.title ?? data.title;
  const heroImageUrl = post?.photos?.[0]?.photo_url ?? data.heroImageUrl;

  const authorName =
    authorRes?.user ? `${authorRes.user.first_name} ${authorRes.user.last_name}`.trim() : data.author.name;
  const authorAvatarUrl = authorRes?.user?.profile_url ? resolveApiUrl(authorRes.user.profile_url) : data.author.avatarUrl;
  const authorMeta = post?.created_at ? `${new Date(post.created_at).toLocaleString()} • ${data.author.meta.split("•")[1]?.trim() ?? ""}` : data.author.meta;

  const postBody = post?.description ?? data.body;
  const postTags = post?.tags?.length ? post.tags : data.tags;
  const likes = typeof post?.likes === "number" ? post.likes : data.likes;
  const comments = typeof post?.comments === "number" ? post.comments : data.comments;

  const loc = post?.location ?? data.location;
  const addressLine =
    typeof loc?.latitude === "number" && typeof loc?.longitude === "number"
      ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      : data.rightRail.addressLine;

  return (
    <div className="bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex max-w-[1440px] mx-auto min-h-screen relative">
        <main className="flex-1 lg:max-w-4xl border-r border-slate-200 dark:border-[#262626] min-h-screen">
          <LocationDetailsHeader />
          {postLoading ? (
            <div className="p-6 text-slate-500 text-sm">Loading…</div>
          ) : postError || !post ? (
            <>
              <LocationHero title={data.title} imageUrl={data.heroImageUrl} />
              <div className="px-6 pb-6 text-slate-500 text-sm">
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
                  name: authorName,
                  avatarUrl: authorAvatarUrl,
                  badge: data.author.badge,
                  meta: authorMeta,
                }}
                title={heroTitle}
                body={postBody}
                tags={postTags}
                likes={likes}
                comments={comments}
                commentsOpen={commentsOpen}
                onToggleComments={() => setCommentsOpen((v) => !v)}
                showFollow={Boolean(me?.user?.id && post?.user_id && me.user.id !== post.user_id)}
              />
            </>
          )}
          {commentsOpen ? (
            <div id="comments">
              <LocationCommunityQa
                currentUserAvatarUrl={currentUserAvatarUrl}
                items={data.qa}
              />
            </div>
          ) : null}
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

