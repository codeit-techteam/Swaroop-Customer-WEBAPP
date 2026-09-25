"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CREDIT_DOCUMENT_DEFINITIONS } from "@/mock/credit-application";
import {
  countRequiredUploaded,
  creditTermLabel,
  monthlyPurchaseLabel,
  parseCreditLimit,
} from "@/lib/credit-application";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreditApplicationStore } from "@/store/creditApplicationStore";
import type {
  CreditDocumentId,
  UploadedCreditDocument,
} from "@/types/credit-application";
import { CreditDocumentUploadCard } from "./credit-document-upload-card";

interface CreditUploadStepProps {
  fieldErrors: Record<string, string>;
  onClearError: (key: string) => void;
  onBack: () => void;
  onSaveDraft: () => void | Promise<void>;
  onSubmit: () => void;
  submitting: boolean;
  onPreview: (doc: UploadedCreditDocument) => void;
  /** Status banner rendered above the checklist (e.g. documents required). */
  notice?: ReactNode;
  submitLabel?: string;
  showDeclaration?: boolean;
  showBack?: boolean;
  showSaveDraft?: boolean;
}

export function CreditUploadStep({
  fieldErrors,
  onClearError,
  onBack,
  onSaveDraft,
  onSubmit,
  submitting,
  onPreview,
  notice,
  submitLabel = "Submit credit application",
  showDeclaration = true,
  showBack = true,
  showSaveDraft = true,
}: CreditUploadStepProps) {
  const requestedLimit = useCreditApplicationStore((s) => s.requestedLimit);
  const creditTerm = useCreditApplicationStore((s) => s.creditTerm);
  const monthlyPurchase = useCreditApplicationStore((s) => s.monthlyPurchase);
  const documents = useCreditApplicationStore((s) => s.documents);
  const documentErrors = useCreditApplicationStore((s) => s.documentErrors);
  const declarationAccepted = useCreditApplicationStore(
    (s) => s.declarationAccepted,
  );
  const setDeclarationAccepted = useCreditApplicationStore(
    (s) => s.setDeclarationAccepted,
  );
  const uploadDocument = useCreditApplicationStore((s) => s.uploadDocument);
  const clearDocumentSlot = useCreditApplicationStore(
    (s) => s.clearDocumentSlot,
  );

  const { uploaded, required } = countRequiredUploaded(documents);
  const parsedLimit = parseCreditLimit(requestedLimit);

  async function handleUpload(
    id: CreditDocumentId,
    file: File,
    onProgress: (percent: number) => void,
  ) {
    await uploadDocument(id, file, onProgress);
    onClearError(`doc_${id}`);
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Step 2 of 2 · Documents
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Confirm request, then upload remaining KYC files
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-right sm:min-w-[320px]">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">
                Limit
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-slate-900">
                {parsedLimit ? formatInr(parsedLimit) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">
                Term
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {creditTermLabel(creditTerm)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">
                Volume
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {monthlyPurchaseLabel(monthlyPurchase)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-card">
        <span className="font-medium text-slate-700">
          Required documents ready
        </span>
        <span className="font-semibold tabular-nums text-slate-900">
          {uploaded} / {required}
        </span>
      </div>

      {notice}

      <h3 className="text-sm font-semibold text-slate-900">
        Required documents
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {CREDIT_DOCUMENT_DEFINITIONS.map((def) => (
          <CreditDocumentUploadCard
            key={def.id}
            definition={def}
            upload={documents[def.id]}
            error={fieldErrors[`doc_${def.id}`] ?? documentErrors[def.id]}
            onUpload={(file, onProgress) =>
              handleUpload(def.id, file, onProgress)
            }
            onRemove={() => clearDocumentSlot(def.id)}
            onPreview={onPreview}
            disabled={submitting}
          />
        ))}
      </div>

      <Card className="border-slate-200 shadow-card">
        <CardContent className="space-y-4 p-4 sm:p-6">
          {showDeclaration ? (
            <div className="flex items-start gap-3">
              <Checkbox
                id="declaration"
                checked={declarationAccepted}
                onCheckedChange={(checked) => {
                  setDeclarationAccepted(checked === true);
                  onClearError("declaration");
                }}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="declaration"
                  className="cursor-pointer text-sm leading-relaxed text-slate-700"
                >
                  I confirm that all submitted documents are genuine and
                  authorize PetroTrade to verify my business details for credit
                  assessment. <span className="text-red-500">*</span>
                </Label>
                {fieldErrors.declaration ? (
                  <p className="text-xs text-red-600">
                    {fieldErrors.declaration}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2",
              showDeclaration && "border-t border-slate-100 pt-4",
            )}
          >
            <div className="flex flex-wrap gap-2">
              {showBack ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                  onClick={onBack}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : null}
              {showSaveDraft ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="rounded-xl"
                  onClick={onSaveDraft}
                  disabled={submitting}
                >
                  Save draft
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              size="lg"
              className="min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
