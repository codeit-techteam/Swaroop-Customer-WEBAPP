import type { Metadata } from "next";
import { ForgotOtpPageShell } from "@/components/auth/forgot-otp-page-shell";

export const metadata: Metadata = {
  title: "OTP Verification",
  description: "Verify your identity to reset your PolyStoreX password",
};

export default function ForgotPasswordOtpPage() {
  return <ForgotOtpPageShell />;
}
