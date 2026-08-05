import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Account Manager removed — send legacy links to Support overview */
export default function Page() {
  redirect(ROUTES.support);
}
