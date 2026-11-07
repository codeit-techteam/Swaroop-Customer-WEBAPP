import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Password reset OTP is retired — use mobile OTP login instead. */
export default function ForgotPasswordOtpPage() {
  redirect(ROUTES.login);
}
