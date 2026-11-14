"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

/** Routes that require completed KYC for transactional / account actions. */
const KYC_GATED_PREFIXES = [
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.purchaseRequests,
  ROUTES.orders,
  ROUTES.payments,
  ROUTES.documents,
  ROUTES.profile,
  ROUTES.support,
  ROUTES.shipmentTracking,
  ROUTES.importTrading,
] as const;

function isKycGatedPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === ROUTES.kyc || pathname.startsWith(`${ROUTES.kyc}/`)) {
    return false;
  }
  if (
    pathname === ROUTES.onboarding ||
    pathname.startsWith(`${ROUTES.onboarding}/`)
  ) {
    return false;
  }
  if (pathname === ROUTES.marketplace || pathname.startsWith("/product")) {
    return false;
  }
  if (pathname === ROUTES.dashboard) return false;
  return KYC_GATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

interface KycFeatureGateProps {
  children: ReactNode;
}

/**
 * Shows an explicit KYC completion panel instead of a silent redirect when a
 * signed-in buyer opens a gated feature without verified KYC.
 */
export function KycFeatureGate({ children }: KycFeatureGateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useOnboardingStore((s) => s.isCompleted);
  const syncStatus = useProfileStore((s) => s.syncStatus);
  const company = useProfileStore((s) => s.company);

  if (!isAuthenticated || !isKycGatedPath(pathname)) {
    return <>{children}</>;
  }

  // Wait for first KYC sync when we have a user — avoid flash of the gate.
  if (syncStatus === "loading" || syncStatus === "idle") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
        <span className="sr-only">Checking KYC status…</span>
      </div>
    );
  }

  if (onboardingCompleted || company.gstVerified) {
    return <>{children}</>;
  }

  // syncStatus === "ready" | "error" with incomplete KYC → show the gate.

  const nextPath = `${pathname ?? ROUTES.dashboard}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const kycHref = `${ROUTES.kyc}?next=${encodeURIComponent(nextPath)}`;

  const missing: string[] = [];
  if (!company.panVerified && !company.pan) missing.push("PAN verification");
  else if (!company.panVerified) missing.push("PAN verification");
  if (!company.gstVerified && !company.gstNumber)
    missing.push("GSTIN verification");
  else if (!company.gstVerified) missing.push("GSTIN verification");
  if (missing.length === 0) {
    missing.push("Business KYC submission and admin verification");
  }

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
    >
      <div className="flex items-center gap-2 text-base font-semibold">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
        Complete your KYC to access this feature.
      </div>
      <p className="text-sm text-amber-900/90">
        PolyStoreX requires verified business KYC before cart, orders, payments,
        support tickets, and profile actions. Missing steps:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900/90">
        {missing.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <Link
        href={kycHref}
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Complete KYC
      </Link>
    </div>
  );
}
