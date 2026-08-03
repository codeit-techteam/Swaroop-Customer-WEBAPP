import type { Metadata } from "next";
import { PasswordResetSuccessPageShell } from "@/components/auth/password-reset-success-page-shell";

export const metadata: Metadata = {
  title: "Password Reset Success",
  description: "Your PetroTrade account password has been updated",
};

export default function PasswordResetSuccessPage() {
  return <PasswordResetSuccessPageShell />;
}
