import type { SidebarUser } from "@/components/shared/AppSidebar";
import type { UserPrivate } from "@/types/auth";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

export function mapUserPrivateToSidebarUser(user: UserPrivate): SidebarUser {
  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
  return {
    name,
    role: user.role || "Member",
    avatarUrl: user.profile_url ? resolveApiUrl(user.profile_url) : undefined,
  };
}

