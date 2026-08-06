"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type {
  CreditDocumentDefinition,
  UploadedCreditDocument,
} from "@/types/credit-application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const MAX_MB = 10;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CreditDocumentUploadCardProps {
  definition: CreditDocumentDefinition;
  upload?: UploadedCreditDocument;
  error?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onPreview: (upload: UploadedCreditDocument) => void;
}

export function CreditDocumentUploadCard({
  definition,
  upload,
  error,
  onUpload,
  onRemove,
  onPreview,
}: CreditDocumentUploadCardProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const simulateUpload = useCallback(
    (file: File) => {
      setUploading(true);
      setProgress(0);
      setLocalError(null);

      let current = 0;
      const interval = window.setInterval(() => {
        current += Math.random() * 30 + 20;
        if (current >= 100) {
          current = 100;
          window.clearInterval(interval);
          setProgress(100);
          window.setTimeout(() => {
            setUploading(false);
            onUpload(file);
            setProgress(0);
          }, 250);
        } else {
          setProgress(Math.min(current, 92));
        }
      }, 100);
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      if (rejected.length > 0) {
        setLocalError(`Invalid file. Max ${MAX_MB}MB. PDF, PNG, or JPG only.`);
        return;
      }
      const file = accepted[0];
      if (!file) return;
      if (file.size > MAX_MB * 1024 * 1024) {
        setLocalError(`File exceeds ${MAX_MB}MB limit.`);
        return;
      }
      simulateUpload(file);
    },
    [simulateUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    disabled: uploading || Boolean(upload),
    multiple: false,
  });

  const displayError = error ?? localError;
  const fromOnboarding = upload?.source === "onboarding";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-card",
        fromOnboarding ? "border-emerald-200" : "border-slate-200",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {definition.title}
            </p>
            {definition.subtitle ? (
              <p className="text-xs text-slate-500">{definition.subtitle}</p>
            ) : null}
            <p className="mt-0.5 text-xs text-slate-400">
              {definition.acceptLabel}
            </p>
          </div>
        </div>
        {definition.required ? (
          <Badge
            variant="destructive"
            className="shrink-0 rounded-md text-[10px]"
          >
            Required
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 rounded-md text-[10px]">
            Optional
          </Badge>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!upload && !uploading ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 transition-colors hover:border-brand/40 hover:bg-brand/[0.02]",
                isDragActive && "border-brand bg-brand/[0.04]",
              )}
            >
              <input
                {...getInputProps()}
                aria-label={`Upload ${definition.title}`}
              />
              <div className="flex flex-col items-center text-center">
                <CloudUpload className="mb-2 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  Upload File
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Drag & Drop Supported
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  PDF · PNG · JPG · Maximum {MAX_MB} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-lg"
                  tabIndex={-1}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {uploading ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        ) : null}

        {upload && !uploading ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "rounded-xl border p-3",
              fromOnboarding
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-emerald-100 bg-emerald-50/40",
            )}
          >
            <div className="flex items-start gap-3">
              {fromOnboarding ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="success"
                    className="rounded-full text-[10px] uppercase"
                  >
                    {fromOnboarding ? "On File" : "Uploaded"}
                  </Badge>
                  {fromOnboarding ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-200 text-[10px] text-emerald-700"
                    >
                      From Onboarding
                    </Badge>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onPreview(upload)}
                  className="mt-1 block truncate text-left text-sm font-medium text-brand hover:underline"
                >
                  {upload.fileName}
                </button>
                <p className="text-xs text-slate-500">
                  {fromOnboarding
                    ? "Provided during customer onboarding — no re-upload needed"
                    : formatFileSize(upload.fileSizeBytes)}
                </p>
              </div>
              {!fromOnboarding ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {displayError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}

export { formatFileSize };
