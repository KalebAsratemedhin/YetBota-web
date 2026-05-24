"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ReputationCard from "@/components/profile/ReputationCard";
import BadgesCard from "@/components/profile/BadgesCard";
import RecentActivityCard from "@/components/profile/RecentActivityCard";
import ContributionsGrid from "@/components/profile/Contributions";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";
import { mapUserPrivateToProfileUser } from "@/lib/mapUserPrivateToProfileUser";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";

export default function ProfileContent() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading, isFetching, isError, refetch } = useGetMeQuery(undefined, { skip: !accessToken });

  const user = data?.user ? mapUserPrivateToProfileUser(data.user) : MOCK_PROFILE_USER;

  if (isLoading || (isFetching && !data?.user)) {
    return (
      <div className="bg-bg min-h-[50vh] flex items-center justify-center text-fg-faint text-sm">
        Loading profile…
      </div>
    );
  }

  if (isError && !data?.user) {
    return (
      <div className="bg-bg text-fg min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 sm:px-6">
        <p className="text-fg-muted text-sm">Could not load your profile.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-brand font-semibold text-sm hover:underline"
        >
          Retry
        </button>
        <Link href="/settings" className="text-fg-faint text-sm hover:text-fg">
          Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg text-fg">
      <div className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 pt-4 sm:pt-6">
        <ProfileHeader user={user} onProfileImageUploaded={() => void refetch()} />
      </div>

      <div className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 pb-8 sm:pb-10 pt-8 sm:pt-10">
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <ReputationCard user={user} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <BadgesCard badges={user.badges} />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <RecentActivityCard />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ContributionsGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
