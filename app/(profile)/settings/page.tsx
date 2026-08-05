import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Legacy /settings route — MVP profile lives at /profile */
export default function SettingsRedirectPage() {
  redirect(ROUTES.profile);
}
