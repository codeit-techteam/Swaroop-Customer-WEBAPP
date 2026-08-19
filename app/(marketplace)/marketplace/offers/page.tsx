import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Offers are integrated into the unified Marketplace page. */
export default function MarketplaceOffersRoute() {
  redirect(ROUTES.marketplace);
}
