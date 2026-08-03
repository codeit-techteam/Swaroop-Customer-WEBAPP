"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightSlot?: React.ReactNode;
  labelAction?: React.ReactNode;
  containerClassName?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon: LeftIcon,
      rightSlot,
      labelAction,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {(label || labelAction) && (
          <div className="flex items-center justify-between gap-2">
            {label ? (
              <label
                htmlFor={inputId}
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {label}
              </label>
            ) : (
              <span />
            )}
            {labelAction}
          </div>
        )}
        <div className="relative">
          {LeftIcon ? (
            <LeftIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground transition-colors",
              "placeholder:text-muted-foreground/60",
              "focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
              LeftIcon && "pl-10",
              rightSlot && "pr-10",
              error && "border-destructive focus-visible:ring-destructive/30",
              className,
            )}
            {...props}
          />
          {rightSlot ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          ) : null}
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";
