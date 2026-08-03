"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { REJECTION_COPY } from "@/mock/approval";
import type { RejectionInfo } from "@/types/order-journey";

interface RejectedCardProps {
  rejection: RejectionInfo;
  onModify: () => void;
  onBrowse: () => void;
}

export function RejectedCard({
  rejection,
  onModify,
  onBrowse,
}: RejectedCardProps) {
  return (
    <div className="space-y-4">
      <Card className="border-red-100 bg-red-50/50">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div>
            <p className="text-xl font-semibold text-red-950">
              {REJECTION_COPY.title}
            </p>
            <p className="mt-1 text-sm text-red-800/80">
              {REJECTION_COPY.subtitle}
            </p>
            <p className="mt-3 font-mono text-sm font-semibold text-red-900">
              {rejection.displayId}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Reason
            </p>
            <p className="mt-1 text-sm text-slate-800">{rejection.reason}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Suggested Action
            </p>
            <p className="mt-1 text-sm text-slate-800">
              {rejection.suggestedAction}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
              onClick={onModify}
            >
              {REJECTION_COPY.modifyLabel}
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={onBrowse}
            >
              {REJECTION_COPY.browseLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
