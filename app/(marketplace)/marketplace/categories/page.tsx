import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export default function MarketplaceCategoriesRoute() {
  redirect(ROUTES.marketplace);
}
