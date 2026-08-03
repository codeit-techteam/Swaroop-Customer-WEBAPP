"use client";

import { BackButton } from "@/components/onboarding/BackButton";
import {
  SaveDraftButton,
  SaveDraftLink,
} from "@/components/onboarding/SaveDraftButton";
import { ContinueButton } from "@/components/onboarding/ContinueButton";
import { cn } from "@/lib/utils";

interface StepActionsProps {
  backHref?: string;
  continueLabel: string;
  continueDisabled?: boolean;
  continueType?: "button" | "submit";
  onContinue?: () => void;
  showContinueArrow?: boolean;
  draftVariant?: "button" | "link";
  showEncryptedNote?: boolean;
  className?: string;
}

export function StepActions({
  backHref,
  continueLabel,
  continueDisabled = false,
  continueType = "submit",
  onContinue,
  showContinueArrow = false,
  draftVariant = "button",
  showEncryptedNote = false,
  className,
}: StepActionsProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {backHref ? <BackButton href={backHref} /> : null}
        {showEncryptedNote ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px]"
              aria-hidden="true"
            >
              🔒
            </span>
            Encrypted Data Submission
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        {draftVariant === "link" ? (
          <SaveDraftLink />
        ) : (
          <SaveDraftButton variant="outline" />
        )}
        <ContinueButton
          label={continueLabel}
          type={continueType}
          disabled={continueDisabled}
          onClick={onContinue}
          showArrow={showContinueArrow}
        />
      </div>
    </div>
  );
}
