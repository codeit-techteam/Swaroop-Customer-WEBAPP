"use client";

import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function showSuccessToast(message: string, description?: string): void {
  toast.success(message, {
    description,
    icon: <CheckCircle2 className="h-4 w-4" />,
  });
}

export function showErrorToast(message: string, description?: string): void {
  toast.error(message, { description });
}
