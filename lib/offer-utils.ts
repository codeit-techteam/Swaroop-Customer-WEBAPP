import { ROUTES } from "@/constants";
import type {
  MarketplaceOffer,
  OfferBulkTier,
  OfferStatus,
  OfferSummaryStats,
} from "@/types/offers";

const ENDING_SOON_MS = 24 * 60 * 60 * 1000;

export function getOfferStatus(offer: MarketplaceOffer): OfferStatus {
  const now = Date.now();
  const expires = new Date(offer.expiresAt).getTime();

  if (offer.validFrom && new Date(offer.validFrom).getTime() > now) {
    return "upcoming";
  }
  if (expires <= now) return "expired";
  if (offer.remainingStock <= 0) return "sold_out";
  if (expires - now <= ENDING_SOON_MS) return "ending_soon";
  return "active";
}

export function isOfferPurchasable(offer: MarketplaceOffer): boolean {
  const status = getOfferStatus(offer);
  return status === "active" || status === "ending_soon";
}

export function getTierForQuantity(
  offer: MarketplaceOffer,
  quantityMt: number,
): OfferBulkTier | null {
  if (!offer.bulkTiers?.length) return null;
  const sorted = [...offer.bulkTiers].sort((a, b) => b.minMt - a.minMt);
  return sorted.find((tier) => quantityMt >= tier.minMt) ?? null;
}

export function getEffectiveOfferPrice(
  offer: MarketplaceOffer,
  quantityMt?: number,
): number {
  if (quantityMt != null) {
    const tier = getTierForQuantity(offer, quantityMt);
    if (tier) return tier.discountPrice;
  }
  return offer.offerPrice;
}

export function getBestValueTier(
  offer: MarketplaceOffer,
): OfferBulkTier | null {
  if (!offer.bulkTiers?.length) return null;
  return [...offer.bulkTiers].sort(
    (a, b) => a.discountPrice - b.discountPrice,
  )[0];
}

export function getStartingBulkPrice(offer: MarketplaceOffer): number | null {
  const best = getBestValueTier(offer);
  return best?.discountPrice ?? null;
}

export function calculateOfferSavings(
  offer: MarketplaceOffer,
  quantityMt: number,
): {
  regularTotal: number;
  offerTotal: number;
  savingsTotal: number;
  pricePerMt: number;
  savingsPerMt: number;
} {
  const pricePerMt = getEffectiveOfferPrice(offer, quantityMt);
  const regularTotal = offer.priceBefore * quantityMt;
  const offerTotal = pricePerMt * quantityMt;
  return {
    regularTotal,
    offerTotal,
    savingsTotal: regularTotal - offerTotal,
    pricePerMt,
    savingsPerMt: offer.priceBefore - pricePerMt,
  };
}

export function getOfferTypeLabel(
  offerType: MarketplaceOffer["offerType"],
): string {
  switch (offerType) {
    case "flash_sale":
      return "Limited Time";
    case "bulk_discount":
      return "Bulk Deal";
    case "seasonal":
      return "Special Price";
    case "credit":
      return "Credit Offer";
    case "new_arrival":
      return "New Arrival";
    default:
      return "Offer";
  }
}

export function getOfferSummaryStats(
  offers: MarketplaceOffer[],
): OfferSummaryStats {
  return {
    activeOffers: offers.length,
    limitedTimeDeals: offers.filter((offer) => offer.isLimitedTime).length,
    bulkDiscountCampaigns: offers.filter((offer) => offer.offerType === "bulk_discount")
      .length,
    creditEligibleOffers: offers.filter((offer) => offer.creditEligible).length,
  };
}

export function getOfferDetailHref(offerId: string): string {
  return `${ROUTES.marketplaceOffers}/${offerId}`;
}

export function getOfferQuoteHref(
  offer: MarketplaceOffer,
  options?: { quantity?: number; paymentType?: string },
): string {
  const qty = options?.quantity ?? offer.moq;
  const effectivePrice = getEffectiveOfferPrice(offer, qty);
  const params = new URLSearchParams({
    productId: offer.productId,
    qty: String(qty),
    offerId: offer.id,
    offerPrice: String(effectivePrice),
  });
  if (options?.paymentType) params.set("payment", options.paymentType);
  return `${ROUTES.purchaseRequestsCreate}?${params.toString()}`;
}

export function getStatusLabel(status: OfferStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "ending_soon":
      return "Ending Soon";
    case "expired":
      return "Offer Expired";
    case "sold_out":
      return "Sold Out";
    case "upcoming":
      return "Upcoming";
    case "claimed":
      return "Claimed";
    default:
      return status;
  }
}
