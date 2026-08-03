"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AuthInput, type AuthInputProps } from "@/components/auth/auth-input";

export interface PasswordInputProps extends Omit<
  AuthInputProps,
  "type" | "leftIcon" | "rightSlot"
> {
  showLockIcon?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ showLockIcon = true, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <AuthInput
      ref={ref}
      type={visible ? "text" : "password"}
      leftIcon={showLockIcon ? Lock : undefined}
      autoComplete={props.autoComplete ?? "current-password"}
      rightSlot={
        <button
          type="button"
          tabIndex={0}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";
