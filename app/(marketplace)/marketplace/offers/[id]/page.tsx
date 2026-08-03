import type { Metadata } from "next";
import { OfferDetailPage } from "@/components/marketplace/offers";
import { getOfferById } from "@/mock/offers";

interface OfferDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OfferDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const offer = getOfferById(id);
  return {
    title: offer ? `${offer.title} | Offers` : "Offer Details",
    description: offer?.description,
  };
}

export default async function OfferDetailRoute({
  params,
}: OfferDetailRouteProps) {
  const { id } = await params;
  return <OfferDetailPage offerId={id} />;
}
