import { redirect } from "next/navigation";
import { SUPPORT_ROUTES } from "@/constants/support";

export default function Page() {
  redirect(SUPPORT_ROUTES.root);
}
