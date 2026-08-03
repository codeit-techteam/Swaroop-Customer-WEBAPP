"use client";

import { toast } from "sonner";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveDraftButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
  label?: string;
}

export function SaveDraftButton({
  variant = "outline",
  className,
  label = "Save Draft",
}: SaveDraftButtonProps) {
  const saveDraft = useOnboardingStore((s) => s.saveDraft);

  function handleSave() {
    saveDraft();
    toast.success("Draft Saved Successfully");
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleSave}
      className={cn(
        variant === "outline" &&
          "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
        className,
      )}
      aria-label="Save onboarding draft"
    >
      {label}
    </Button>
  );
}

export function SaveDraftLink({ className }: { className?: string }) {
  const saveDraft = useOnboardingStore((s) => s.saveDraft);

  function handleSave() {
    saveDraft();
    toast.success("Draft Saved Successfully");
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      className={cn(
        "text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
        className,
      )}
      aria-label="Save onboarding draft"
    >
      Save Draft
    </button>
  );
}
