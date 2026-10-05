"use client";

import { useEffect } from "react";

import { fetchCustomerKyc } from "@/services/customer-kyc";
import { useProfileStore } from "@/store/profileStore";

/**
 * Syncs GST / PAN verification badges on the profile from the backend KYC
 * record, so the web shows the same verification state as the mobile app.
 */
export function useKycIdentitySync(enabled = true) {
  const updateCompany = useProfileStore((s) => s.updateCompany);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchCustomerKyc()
      .then((overview) => {
        if (!active) return;
        const { gstin, pan } = overview.organization;
        updateCompany({
          gstVerified: overview.verifications.gst?.status === "VERIFIED",
          panVerified: overview.verifications.pan?.status === "VERIFIED",
          ...(gstin ? { gstNumber: gstin } : {}),
          ...(pan ? { pan } : {}),
        });
      })
      .catch(() => {
        if (active) updateCompany({ gstVerified: false, panVerified: false });
      });
    return () => {
      active = false;
    };
  }, [enabled, updateCompany]);
}
