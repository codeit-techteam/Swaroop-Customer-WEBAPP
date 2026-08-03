"use client";

import { useMemo } from "react";
import { passwordRules } from "@/lib/auth-schemas";
import {
  RequirementChecklist,
  type RequirementItem,
} from "@/components/auth/requirement-checklist";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const items: RequirementItem[] = useMemo(
    () => [
      {
        id: "length",
        label: "Minimum 8 characters length",
        met: passwordRules.minLength(password),
      },
      {
        id: "case",
        label: "Include uppercase & lowercase letters",
        met:
          passwordRules.hasUppercase(password) &&
          passwordRules.hasLowercase(password),
      },
      {
        id: "symbol",
        label: "At least one numeric and special symbol",
        met:
          passwordRules.hasNumber(password) &&
          passwordRules.hasSpecial(password),
      },
    ],
    [password],
  );

  return <RequirementChecklist items={items} className={className} />;
}
