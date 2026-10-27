import type { Metadata } from "next";
import { ResetPasswordPageShell } from "@/components/auth/reset-password-page-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your PolyStoreX account",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageShell />;
}
