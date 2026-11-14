"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileDrawer } from "@/components/profile/ProfileDrawer";
import { ROUTES } from "@/constants";
import { getInitials, resolveMvpProfile } from "@/lib/profile-display";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

export function ProfileAvatarButton() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const company = useProfileStore((s) => s.company);
  const profile = resolveMvpProfile(user, company);
  const initials = profile.avatarUrl
    ? getInitials(profile.fullName || "PX")
    : profile.companyInitials || "PX";

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        variant="outline"
        className="h-10 rounded-xl border-slate-200 px-3 text-sm font-semibold"
      >
        <Link href={ROUTES.login}>Sign in</Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl p-0 focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Open profile menu"
        onClick={() => setOpen(true)}
      >
        <Avatar className="h-9 w-9 border border-slate-200">
          {profile.avatarUrl ? (
            <AvatarImage
              src={profile.avatarUrl}
              alt={profile.fullName || "Account"}
            />
          ) : null}
          <AvatarFallback className="bg-brand text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Button>
      <ProfileDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
