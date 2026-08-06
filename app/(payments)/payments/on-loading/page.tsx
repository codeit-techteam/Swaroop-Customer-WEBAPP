import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export default function Page() {
  redirect(`${ROUTES.payments}?type=on_loading`);
}
