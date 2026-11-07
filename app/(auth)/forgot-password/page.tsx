import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Password login is removed — customers sign in with mobile OTP only. */
export default function ForgotPasswordPage() {
  redirect(ROUTES.login);
}
