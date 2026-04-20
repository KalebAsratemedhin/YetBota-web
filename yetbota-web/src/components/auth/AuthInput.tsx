"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightLabel?: React.ReactNode;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, rightLabel, error, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {(label || rightLabel) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && <label className="text-sm text-gray-300 font-medium">{label}</label>}
            {rightLabel && <div className="text-sm">{rightLabel}</div>}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none",
              "focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all",
              isPassword && "pr-11",
              error && "border-red-500/50",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
export default AuthInput;