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

      {/* Main — no extra padding, fits exactly in viewport */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">

        {/* Profile header */}
        <ProfileHeader user={user} />

        {/* Body — two columns, fills remaining height */}
        <div className="flex-1 grid grid-cols-[300px_1fr] gap-3 overflow-hidden">

          {/* Left column */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <ReputationCard user={user} />
            <RecentActivityCard />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <BadgesCard />
            <ContributionsGrid />
          </div>

        </div>
      </div>
    </div>
  );
}