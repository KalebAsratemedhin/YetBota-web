import RequireAuth from "@/components/auth/RequireAuth";
import ProfileContent from "./ProfileContent";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
