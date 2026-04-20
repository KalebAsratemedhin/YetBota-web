import AppSidebar from "@/components/shared/AppSidebar";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";

export default function ProfileSidebar() {
  const user = MOCK_PROFILE_USER;
  return (
    <AppSidebar user={{ name: user.name, role: user.role, level: user.level }} />
  );
}