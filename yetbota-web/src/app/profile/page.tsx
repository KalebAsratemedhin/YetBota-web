import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ReputationCard from "@/components/profile/ReputationCard";
import BadgesCard from "@/components/profile/BadgesCard";
import RecentActivityCard from "@/components/profile/RecentActivityCard";
import ContributionsGrid from "@/components/profile/Contributions";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";

export default function ProfilePage() {
  const user = MOCK_PROFILE_USER;

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      <ProfileSidebar />

      {/* Main content*/}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Cover + header */}
        <div className="px-4 pt-4 shrink-0">
          <ProfileHeader user={user} />
        </div>

        {/* Body — two columns */}
        <div className="flex-1 grid grid-cols-[320px_1fr] gap-3 px-4 pb-4 pt-3 overflow-hidden">

          {/* Left: Reputation + Activity */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <ReputationCard user={user} />
            <RecentActivityCard />
          </div>

          {/* Right: Badges + Contributions */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <BadgesCard />
            <ContributionsGrid />
          </div>

        </div>
      </div>
    </div>
  );
}