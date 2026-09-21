import type { Metadata } from "next";
import { OfferDetailPage } from "@/components/marketplace/offers";

interface OfferDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OfferDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Offer Details",
    description: `Marketplace offer ${id}`,
  };
}

export default async function OfferDetailRoute({
  params,
}: OfferDetailRouteProps) {
  const { id } = await params;
  return <OfferDetailPage offerId={id} />;
}
