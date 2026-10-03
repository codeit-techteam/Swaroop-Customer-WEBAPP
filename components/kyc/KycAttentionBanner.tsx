"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareWarning, ShieldAlert, XCircle } from "lucide-react";
import { ROUTES } from "@/constants";
import {
  fetchCustomerKyc,
  kycNeedsAction,
  type CustomerKycOverview,
} from "@/services/customer-kyc";
import { useAuthStore } from "@/store/authStore";

/**
 * Surfaces an admin change request or KYC rejection on every customer page,
 * re-checked on navigation and when the tab regains focus.
 */
export function KycAttentionBanner() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const check = () => {
      fetchCustomerKyc()
        .then((next) => {
          if (!cancelled) setOverview(next);
        })
        .catch(() => undefined);
    };
    check();
    window.addEventListener("focus", check);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", check);
    };
  }, [isAuthenticated, pathname]);

  if (!isAuthenticated || !overview || overview.kycVerified) return null;
  if (pathname === ROUTES.kyc) return null;

  if (overview.status === "NOT_SUBMITTED") {
    return (
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-800 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            Complete your Business KYC
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Verify your PAN and GSTIN and upload your documents to get full
            access to PetroTrade.
          </p>
        </div>
        <Link
          href={ROUTES.kyc}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Start KYC
        </Link>
      </div>
    );
  }
  if (!kycNeedsAction(overview.status)) return null;

  const changes = overview.status === "CHANGES_REQUESTED";
  const reason = changes
    ? overview.changeRequest?.reason
    : overview.rejectedReason;

  return (
    <div
      role="alert"
      className={
        changes
          ? "mb-4 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center"
          : "mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 sm:flex-row sm:items-center"
      }
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          {changes ? (
            <MessageSquareWarning className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {changes
            ? "PetroTrade requested changes to your KYC"
            : "Your KYC needs correction"}
        </p>
        {reason ? (
          <p className="mt-1 line-clamp-2 text-sm opacity-90">{reason}</p>
        ) : null}
      </div>
      <Link
        href={ROUTES.kyc}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Update &amp; Resubmit
      </Link>
    </div>
  );
}
