"use client";

import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        "rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive",
        className,
      )}
    >
      {message}
    </p>
  );
}
