import AppSidebar from "@/components/shared/AppSidebar";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = MOCK_PROFILE_USER;

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <AppSidebar user={{ name: user.name, role: user.role, level: user.level }} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

