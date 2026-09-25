"use client";

import { ArrowRight, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MONTHLY_PURCHASE_OPTIONS } from "@/mock/credit-application";
import {
  CREDIT_PURPOSE_MIN_CHARS,
  formatLimitInput,
} from "@/lib/credit-application";
import { useCreditApplicationStore } from "@/store/creditApplicationStore";
import type {
  CreditTermOption,
  MonthlyPurchaseBand,
} from "@/types/credit-application";
import { cn } from "@/lib/utils";

interface CreditApplyStepProps {
  fieldErrors: Record<string, string>;
  onClearError: (key: string) => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  hasActiveFacility: boolean;
  saving?: boolean;
}

export function CreditApplyStep({
  fieldErrors,
  onClearError,
  onContinue,
  onSaveDraft,
  hasActiveFacility,
  saving = false,
}: CreditApplyStepProps) {
  const requestedLimit = useCreditApplicationStore((s) => s.requestedLimit);
  const creditTerm = useCreditApplicationStore((s) => s.creditTerm);
  const monthlyPurchase = useCreditApplicationStore((s) => s.monthlyPurchase);
  const purpose = useCreditApplicationStore((s) => s.purpose);
  const setRequestedLimit = useCreditApplicationStore(
    (s) => s.setRequestedLimit,
  );
  const setCreditTerm = useCreditApplicationStore((s) => s.setCreditTerm);
  const setMonthlyPurchase = useCreditApplicationStore(
    (s) => s.setMonthlyPurchase,
  );
  const setPurpose = useCreditApplicationStore((s) => s.setPurpose);

  return (
    <Card className="border-slate-200 shadow-card">
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Step 1 of 2 · Facility details
        </p>
        <CardTitle className="text-base">
          {hasActiveFacility
            ? "Request Additional Credit"
            : "New Credit Application"}
        </CardTitle>
        <p className="text-sm text-slate-500">
          Tell us the facility you need. Documents are collected in the next
          step.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="credit-limit">
              Requested Credit Limit <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="credit-limit"
                value={requestedLimit}
                onChange={(e) => {
                  setRequestedLimit(formatLimitInput(e.target.value));
                  onClearError("requestedLimit");
                }}
                placeholder="25,00,000"
                className={cn(
                  "rounded-xl pl-9",
                  fieldErrors.requestedLimit && "border-red-400",
                )}
              />
            </div>
            {fieldErrors.requestedLimit ? (
              <p className="text-xs text-red-600">
                {fieldErrors.requestedLimit}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Enter the total facility amount you want approved.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Preferred Credit Term <span className="text-red-500">*</span>
            </Label>
            <Select
              value={creditTerm}
              onValueChange={(v) => setCreditTerm(v as CreditTermOption)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_15">Net 15 Days</SelectItem>
                <SelectItem value="net_30">Net 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Expected Monthly Purchase <span className="text-red-500">*</span>
            </Label>
            <Select
              value={monthlyPurchase}
              onValueChange={(v) => {
                setMonthlyPurchase(v as MonthlyPurchaseBand);
                onClearError("monthlyPurchase");
              }}
            >
              <SelectTrigger
                className={cn(
                  "rounded-xl",
                  fieldErrors.monthlyPurchase && "border-red-400",
                )}
              >
                <SelectValue placeholder="Select volume band" />
              </SelectTrigger>
              <SelectContent>
                {MONTHLY_PURCHASE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.monthlyPurchase ? (
              <p className="text-xs text-red-600">
                {fieldErrors.monthlyPurchase}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="purpose">
              Purpose of Credit <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                onClearError("purpose");
              }}
              placeholder="Example: Working capital for polymer procurement across Western India plants. Typical monthly lift is 80–120 MT of PP and HDPE."
              className={cn(
                "min-h-[120px] rounded-xl",
                fieldErrors.purpose && "border-red-400",
              )}
            />
            <div className="flex items-center justify-between gap-2">
              {fieldErrors.purpose ? (
                <p className="text-xs text-red-600">{fieldErrors.purpose}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Minimum {CREDIT_PURPOSE_MIN_CHARS} characters. This is used
                  during underwriting.
                </p>
              )}
              <p className="shrink-0 text-xs tabular-nums text-slate-400">
                {purpose.trim().length}/{CREDIT_PURPOSE_MIN_CHARS}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={onSaveDraft}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save draft"
            )}
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
            onClick={onContinue}
            disabled={saving}
          >
            Continue to documents
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
