import ProfileHeader from "@/components/profile/ProfileHeader";
import ReputationCard from "@/components/profile/ReputationCard";
import BadgesCard from "@/components/profile/BadgesCard";
import RecentActivityCard from "@/components/profile/RecentActivityCard";
import ContributionsGrid from "@/components/profile/Contributions";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";

export default function ProfileContent() {
  const user = MOCK_PROFILE_USER;

  return (
    <div className="bg-[#0a0a0a] text-white">
      <div className="mx-auto w-full max-w-[1152px] px-6 pt-6">
        <ProfileHeader user={user} />
      </div>

      <div className="mx-auto w-full max-w-[1152px] px-6 pb-10 pt-10">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4">
            <ReputationCard user={user} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <BadgesCard />
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
