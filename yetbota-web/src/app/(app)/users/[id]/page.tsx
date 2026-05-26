"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ReputationCard from "@/components/profile/ReputationCard";
import BadgesCard from "@/components/profile/BadgesCard";
import ContributionsGrid from "@/components/profile/Contributions";
import FollowButton from "@/components/profile/FollowButton";
import { mapUserPrivateToProfileUser } from "@/lib/mapUserPrivateToProfileUser";
import { useGetMeQuery, useGetUserByIdQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const { data, isLoading, isFetching, isError, refetch } = useGetUserByIdQuery(
    { id, resolution: "WEB" },
    { skip: !accessToken || !id }
  );

  const meId = me?.user?.id;
  const isSelf = Boolean(meId && id && meId === id);
  const user = data?.user ? mapUserPrivateToProfileUser(data.user) : null;

  if (!accessToken) {
    return (
      <div className="bg-bg min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 sm:px-6 text-sm">
        <p className="text-fg-muted">Sign in to view this profile.</p>
        <Link href="/signin" className="text-brand font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading || (isFetching && !user)) {
    return (
      <div className="bg-bg min-h-[50vh] flex items-center justify-center text-fg-faint text-sm">
        Loading profile…
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="bg-bg text-fg min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 sm:px-6">
        <p className="text-fg-muted text-sm">Could not load this profile.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-brand font-semibold text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg text-fg">
      <div className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 pt-4 sm:pt-6">
        <ProfileHeader user={user} readOnly={!isSelf} />
        {!isSelf && meId && (
          <div className="flex justify-end mt-4">
            <FollowButton meId={meId} followeeId={id} />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 pb-8 sm:pb-10 pt-6 sm:pt-8">
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <ReputationCard user={user} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <BadgesCard badges={user.badges} />
          </div>
          <div className="col-span-12">
            <ContributionsGrid userId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
