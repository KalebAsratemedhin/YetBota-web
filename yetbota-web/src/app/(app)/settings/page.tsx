import RequireAuth from "@/components/auth/RequireAuth";
import SettingsContent from "./SettingsContent";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
