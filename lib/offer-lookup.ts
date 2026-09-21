import { useOffersStore } from "@/store/offersStore";
import type { MarketplaceOffer } from "@/types/offers";

export function getLiveOfferById(id: string): MarketplaceOffer | undefined {
  return useOffersStore.getState().getOffer(id);
}
