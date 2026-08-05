import type { Metadata } from "next";
import { MyOffersPage } from "@/components/marketplace/offers/my-offers-page";

export const metadata: Metadata = {
  title: "My Offers | PetroTrade",
  description: "Track your saved, applied and used marketplace offers.",
};

export default function Page() {
  return <MyOffersPage />;
}
