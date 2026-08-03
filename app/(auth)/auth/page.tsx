import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Legacy /auth route — redirect to login */
export default function AuthRedirectPage() {
  redirect(ROUTES.login);
}
