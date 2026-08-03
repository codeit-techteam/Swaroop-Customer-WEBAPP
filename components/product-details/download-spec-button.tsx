"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadSpecButtonProps {
  productName: string;
  className?: string;
}

export function DownloadSpecButton({
  productName,
  className,
}: DownloadSpecButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-10 w-full rounded-xl text-xs font-medium text-slate-500",
        className,
      )}
      onClick={() =>
        toast.success("Specification download started", {
          description: `${productName} — mock PDF (frontend only).`,
        })
      }
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      Download Specification
    </Button>
  );
}
