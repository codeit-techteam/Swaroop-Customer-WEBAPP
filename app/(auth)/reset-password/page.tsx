import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Password reset is retired — customers sign in with mobile OTP only. */
export default function ResetPasswordPage() {
  redirect(ROUTES.login);
}
