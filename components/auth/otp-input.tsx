"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  /** filled = muted empty cells; outlined = bordered white cells */
  variant?: "filled" | "outlined";
  "aria-label"?: string;
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  variant = "filled",
  "aria-label": ariaLabel = "One-time password",
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const chars = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    return Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? "");
  }, [value]);

  const focusIndex = React.useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const commit = React.useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join("").slice(0, OTP_LENGTH));
    },
    [onChange],
  );

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      commit(next);
      return;
    }

    if (cleaned.length > 1) {
      // Paste into a single box
      const next = [...digits];
      const chars = cleaned.slice(0, OTP_LENGTH - index).split("");
      chars.forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      commit(next);
      const nextFocus = Math.min(index + chars.length, OTP_LENGTH - 1);
      focusIndex(nextFocus);
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    commit(next);
    if (index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        commit(next);
        focusIndex(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    commit(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={6}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-md text-center text-lg font-semibold text-brand transition-all sm:h-14 sm:w-12",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50",
            variant === "filled" &&
              (digit
                ? "border border-brand/30 bg-white"
                : "border border-transparent bg-muted/70"),
            variant === "outlined" && "border border-input bg-white shadow-sm",
            digit && variant === "outlined" && "border-brand/40",
            "focus-visible:border-accent-blue focus-visible:bg-white",
            error &&
              "border-destructive bg-destructive/5 focus-visible:ring-destructive/30",
            disabled && "cursor-not-allowed opacity-60",
          )}
        />
      ))}
    </div>
  );
}
