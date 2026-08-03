"use client";

import { useCallback, useRef, useState } from "react";
import {
  FileText,
  ImageIcon,
  Replace,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  TRANSFER_METHODS,
  UTR_MAX_LENGTH,
  UTR_MIN_LENGTH,
} from "@/constants/payments";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  PaymentProofUpload,
  TransferMethodId,
  UploadProofFormState,
} from "@/types/payments";

interface UploadProofFormProps {
  form: UploadProofFormState;
  onChange: (patch: Partial<UploadProofFormState>) => void;
  errors: Partial<Record<keyof UploadProofFormState, string>>;
}

function FileDropZone({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: PaymentProofUpload | null;
  onChange: (file: PaymentProofUpload) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (
        !ALLOWED_UPLOAD_TYPES.includes(
          file.type as (typeof ALLOWED_UPLOAD_TYPES)[number],
        )
      ) {
        toast.error("Only JPG, PNG, or PDF allowed");
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast.error("File must be under 10MB");
        return;
      }
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      onChange({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        previewUrl,
        uploadedAt: new Date().toISOString(),
      });
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {value.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.previewUrl}
              alt={value.fileName}
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.fileName}</p>
            <p className="text-xs text-slate-500">
              {(value.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => inputRef.current?.click()}
          >
            <Replace className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={onClear}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition",
            dragging
              ? "border-brand bg-brand/5"
              : "border-slate-300 bg-white hover:border-brand/40",
          )}
        >
          <UploadCloud className="h-8 w-8 text-brand" />
          <p className="text-sm font-medium text-slate-700">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-slate-400">JPG, PNG, PDF · Max 10MB</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function UploadProofForm({
  form,
  onChange,
  errors,
}: UploadProofFormProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Transaction Type</Label>
          <Select
            value={form.transactionType}
            onValueChange={(v) =>
              onChange({ transactionType: v as TransferMethodId })
            }
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSFER_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Reference Number (UTR) *</Label>
          <Input
            value={form.utr}
            onChange={(e) =>
              onChange({ utr: e.target.value.toUpperCase().replace(/\s/g, "") })
            }
            placeholder="e.g. HDFC24080199871"
            className="h-11 rounded-xl font-mono uppercase"
            maxLength={UTR_MAX_LENGTH}
          />
          {errors.utr ? (
            <p className="text-xs text-red-600">{errors.utr}</p>
          ) : (
            <p className="text-xs text-slate-400">
              {UTR_MIN_LENGTH}–{UTR_MAX_LENGTH} characters
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Transaction Date</Label>
          <Input
            type="date"
            value={form.transactionDate}
            onChange={(e) => onChange({ transactionDate: e.target.value })}
            className="h-11 rounded-xl"
          />
          {errors.transactionDate ? (
            <p className="text-xs text-red-600">{errors.transactionDate}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Transaction Time</Label>
          <Input
            type="time"
            value={form.transactionTime}
            onChange={(e) => onChange({ transactionTime: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Paid Amount</Label>
          <Input
            type="number"
            value={form.paidAmount}
            onChange={(e) =>
              onChange({ paidAmount: Number(e.target.value) || 0 })
            }
            className="h-11 rounded-xl"
          />
          <p className="text-xs text-slate-400">
            Expected: {formatInr(form.paidAmount)}
          </p>
          {errors.paidAmount ? (
            <p className="text-xs text-red-600">{errors.paidAmount}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remarks (optional)</Label>
        <Textarea
          value={form.remarks}
          onChange={(e) => onChange({ remarks: e.target.value })}
          placeholder="Any notes for finance team"
          className="min-h-[80px] rounded-xl"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FileDropZone
          label="Upload Screenshot"
          value={form.screenshot}
          onChange={(f) => onChange({ screenshot: f })}
          onClear={() => onChange({ screenshot: null })}
        />
        <FileDropZone
          label="Upload Receipt"
          value={form.receipt}
          onChange={(f) => onChange({ receipt: f })}
          onClear={() => onChange({ receipt: null })}
        />
        <FileDropZone
          label="Upload Bank Advice"
          value={form.bankAdvice}
          onChange={(f) => onChange({ bankAdvice: f })}
          onClear={() => onChange({ bankAdvice: null })}
        />
      </div>
      {errors.screenshot ? (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <ImageIcon className="h-3.5 w-3.5" />
          {errors.screenshot}
        </p>
      ) : null}
    </div>
  );
}

export function validateUploadForm(
  form: UploadProofFormState,
  expectedAmount: number,
): Partial<Record<keyof UploadProofFormState, string>> {
  const errors: Partial<Record<keyof UploadProofFormState, string>> = {};
  if (!form.utr.trim()) {
    errors.utr = "UTR / Reference number is required";
  } else if (
    form.utr.length < UTR_MIN_LENGTH ||
    form.utr.length > UTR_MAX_LENGTH
  ) {
    errors.utr = `UTR must be ${UTR_MIN_LENGTH}–${UTR_MAX_LENGTH} characters`;
  } else if (!/^[A-Z0-9]+$/.test(form.utr)) {
    errors.utr = "UTR can only contain letters and numbers";
  }
  if (!form.transactionDate) {
    errors.transactionDate = "Transaction date is required";
  }
  if (!form.paidAmount || form.paidAmount <= 0) {
    errors.paidAmount = "Enter a valid paid amount";
  } else if (Math.abs(form.paidAmount - expectedAmount) > 1) {
    errors.paidAmount = `Amount should match ${formatInr(expectedAmount)}`;
  }
  if (!form.screenshot && !form.receipt && !form.bankAdvice) {
    errors.screenshot =
      "Upload at least one proof file (screenshot, receipt, or bank advice)";
  }
  return errors;
}
