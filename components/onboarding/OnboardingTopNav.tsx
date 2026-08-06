"use client";

import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface OnboardingTopNavProps {
  className?: string;
  /** Matches design variants across steps */
  saveDraftVariant?: "outline" | "link" | "solid";
}

export function OnboardingTopNav({
  className,
  saveDraftVariant = "outline",
}: OnboardingTopNavProps) {
  const user = useAuthStore((s) => s.user);
  const saveDraft = useOnboardingStore((s) => s.saveDraft);
  const initials = getInitials(user?.name ?? "JD");

  function handleSaveDraft() {
    saveDraft();
    toast.success("Draft Saved Successfully");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8",
        className,
      )}
      role="banner"
    >
      <p className="shrink-0 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
        PetroTrade Portal
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className={cn(
            "hidden text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 sm:inline-flex sm:items-center",
            saveDraftVariant === "outline" &&
              "rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-slate-800 hover:bg-slate-50",
            saveDraftVariant === "link" &&
              "text-slate-600 hover:text-slate-900",
            saveDraftVariant === "solid" &&
              "rounded-lg bg-slate-900 px-3.5 py-1.5 text-white hover:bg-slate-800",
          )}
          aria-label="Save onboarding draft"
        >
          Save Draft
        </button>

        <Avatar className="h-9 w-9 border border-slate-200">
          <AvatarImage src={undefined} alt={user?.name ?? "User profile"} />
          <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
