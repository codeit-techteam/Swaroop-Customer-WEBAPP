"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

interface CreditApplicationSuccessModalProps {
  open: boolean;
  applicationId: string;
  onViewStatus: () => void;
  onOpenChange: (open: boolean) => void;
}

export function CreditApplicationSuccessModal({
  open,
  applicationId,
  onViewStatus,
  onOpenChange,
}: CreditApplicationSuccessModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center sm:rounded-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">
            Application Submitted Successfully
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Application ID{" "}
                <strong className="font-mono text-slate-900">
                  {applicationId}
                </strong>
              </p>
              <p>
                Your credit request has been submitted successfully. Our finance
                team will review your documents.
              </p>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                <Clock className="h-4 w-4 text-brand" />
                <span>
                  Estimated Review Time: <strong>2–5 Business Days</strong>
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              onOpenChange(false);
              router.push(ROUTES.dashboard);
            }}
          >
            Go to Dashboard
          </Button>
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => {
              onOpenChange(false);
              onViewStatus();
            }}
          >
            View Credit Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
