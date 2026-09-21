"use client";

import { useEffect } from "react";

import { useCreditStore } from "@/store/creditStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { useOffersStore } from "@/store/offersStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";

export function CxFeedHydrator() {
  const fetchCatalog = useMarketplaceStore((state) => state.fetchCatalog);
  const fetchOffers = useOffersStore((state) => state.fetchOffers);
  const hydrateFromCatalog = useDashboardStore((state) => state.hydrateFromCatalog);
  const fetchLive = useDashboardStore((state) => state.fetchLive);
  const fetchCredit = useCreditStore((state) => state.fetchFromApi);
  const fetchPurchaseRequests = usePurchaseRequestTrackingStore((state) => state.fetchFromApi);
  const fetchOrders = useOrdersCatalogStore((state) => state.fetchFromApi);
  const fetchPayments = usePaymentsCatalogStore((state) => state.fetchFromApi);
  const fetchDocuments = useDocumentsStore((state) => state.fetchFromApi);
  const fetchShipments = useShipmentTrackingStore((state) => state.fetchFromApi);

  useEffect(() => {
    void (async () => {
      await fetchCatalog();
      hydrateFromCatalog();
      await Promise.allSettled([
        fetchOffers(),
        fetchLive(),
        fetchCredit(),
        fetchPurchaseRequests(),
        fetchOrders(),
        fetchPayments(),
        fetchDocuments(),
        fetchShipments(),
      ]);
    })();
  }, [
    fetchCatalog,
    fetchOffers,
    hydrateFromCatalog,
    fetchLive,
    fetchCredit,
    fetchPurchaseRequests,
    fetchOrders,
    fetchPayments,
    fetchDocuments,
    fetchShipments,
  ]);

  return null;
}
