import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Legacy route — Downloads screen removed. */
export default function Page() {
  redirect(ROUTES.documents);
}
