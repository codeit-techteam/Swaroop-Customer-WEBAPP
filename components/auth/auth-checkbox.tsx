"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: React.ReactNode;
  id?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function AuthCheckbox({
  checked,
  onCheckedChange,
  label,
  id,
  disabled,
  error,
  className,
}: AuthCheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-2.5">
        <CheckboxPrimitive.Root
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
          className={cn(
            "peer mt-0.5 h-4 w-4 shrink-0 rounded-[3px] border border-muted-foreground/40 bg-white shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
            "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
          )}
          aria-invalid={!!error}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            <Check className="h-3 w-3" strokeWidth={3} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label
          htmlFor={checkboxId}
          className="cursor-pointer text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
