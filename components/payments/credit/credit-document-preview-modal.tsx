"use client";

import { Download, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UploadedCreditDocument } from "@/types/credit-application";
import { formatFileSize } from "./credit-document-upload-card";

interface CreditDocumentPreviewModalProps {
  document: UploadedCreditDocument | null;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditDocumentPreviewModal({
  document,
  title,
  open,
  onOpenChange,
}: CreditDocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? "Document Preview"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8">
            <FileText className="mb-3 h-12 w-12 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Mock PDF Preview
            </p>
            {document.source === "onboarding" ? (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                On file from customer onboarding
              </p>
            ) : null}
            <p className="mt-1 max-w-full truncate text-xs text-slate-500">
              {document.fileName}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(document.fileSizeBytes)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.success(`Downloading ${document.fileName}`)}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
