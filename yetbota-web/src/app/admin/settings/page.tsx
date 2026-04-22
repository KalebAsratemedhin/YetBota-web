import { User, Shield, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account and platform configurations
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card rounded-2xl border border-white/5 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Profile Settings</h2>
        </div>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-10 h-10 text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-white">Admin User</p>
            <p className="text-sm text-slate-500 mb-2">Super Administrator</p>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 rounded-lg gap-2"
            >
              <Upload className="w-3 h-3" />
              Upload New Avatar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              First Name
            </label>
            <Input
              defaultValue="Admin"
              className="bg-background border-white/10 rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Last Name
            </label>
            <Input
              defaultValue="User"
              className="bg-background border-white/10 rounded-xl h-11"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phone Number
          </label>
          <Input
            defaultValue="+1 (555) 000-0000"
            className="bg-background border-white/10 rounded-xl h-11"
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-white/5 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Security</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <Input
              type="password"
              defaultValue="••••••••"
              className="bg-background border-white/10 rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <Input
              type="password"
              defaultValue="••••••••"
              className="bg-background border-white/10 rounded-xl h-11"
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-primary">
                Secure your account with a secondary mobile device
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
        <Button
          variant="outline"
          className="border-white/10 text-slate-400 hover:bg-white/5 rounded-xl"
        >
          Discard Changes
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
