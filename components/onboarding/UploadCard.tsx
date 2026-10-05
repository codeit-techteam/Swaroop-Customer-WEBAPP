"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  FileText,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UploadCardProps {
  label?: string;
  description?: string;
  accept?: Record<string, string[]>;
  maxSizeMb?: number;
  fileName?: string | null;
  onUpload: (fileName: string) => void;
  onRemove: () => void;
  /** Stores the file (e.g. signed R2 upload); `onUpload` runs only after it resolves. */
  uploadFile?: (
    file: File,
    onProgress: (percent: number) => void,
  ) => Promise<void>;
  /** Maps an upload failure to a user-facing message. */
  uploadErrorMessage?: (error: unknown) => string;
  required?: boolean;
  compact?: boolean;
  className?: string;
  dropLabel?: string;
  helperText?: string;
}

export function UploadCard({
  label,
  description,
  accept = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSizeMb = 5,
  fileName,
  onUpload,
  onRemove,
  uploadFile,
  uploadErrorMessage,
  required = false,
  compact = false,
  className,
  dropLabel = "Click to upload or drag & drop",
  helperText,
}: UploadCardProps) {
  const resolvedHelper = helperText ?? `Accepted formats (Max ${maxSizeMb}MB)`;
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateUpload = useCallback(
    (name: string) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      let current = 0;
      const interval = window.setInterval(() => {
        current += Math.random() * 35 + 15;
        if (current >= 100) {
          current = 100;
          window.clearInterval(interval);
          setProgress(100);
          window.setTimeout(() => {
            setUploading(false);
            onUpload(name);
            setProgress(0);
          }, 200);
        } else {
          setProgress(Math.min(current, 95));
        }
      }, 120);
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        setError(`Invalid file. Max ${maxSizeMb}MB. Check allowed formats.`);
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMb}MB limit.`);
        return;
      }
      if (!uploadFile) {
        simulateUpload(file.name);
        return;
      }
      setUploading(true);
      setProgress(0);
      setError(null);
      uploadFile(file, (percent) => setProgress(Math.min(percent, 100)))
        .then(() => onUpload(file.name))
        .catch((uploadError: unknown) => {
          setError(
            uploadErrorMessage?.(uploadError) ??
              "Upload failed. Please try again.",
          );
        })
        .finally(() => {
          setUploading(false);
          setProgress(0);
        });
    },
    [maxSizeMb, onUpload, simulateUpload, uploadErrorMessage, uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: uploading || Boolean(fileName),
    multiple: false,
  });

  return (
    <div className={cn("space-y-3", className)}>
      {(label || required) && (
        <div className="flex items-start justify-between gap-2">
          <div>
            {label ? (
              <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            ) : null}
          </div>
          {required ? (
            <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
              Required
            </span>
          ) : null}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!fileName && !uploading ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                isDragActive && "border-slate-900 bg-slate-100",
                compact ? "px-4 py-6" : "px-6 py-10",
              )}
              role="button"
              tabIndex={0}
              aria-label={dropLabel}
            >
              <input {...getInputProps()} aria-label="File upload input" />
              <div className="flex flex-col items-center text-center">
                <CloudUpload
                  className="mb-2 h-8 w-8 text-slate-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-700">
                  {dropLabel}
                </p>
                <p className="mt-1 text-xs text-slate-400">{resolvedHelper}</p>
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
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Uploading…
            </div>
            <Progress
              value={progress}
              className="h-2"
              aria-label="Upload progress"
            />
          </motion.div>
        ) : null}

        {fileName && !uploading ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {fileName}
              </p>
              <p className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Uploaded
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label={`Remove ${fileName}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
