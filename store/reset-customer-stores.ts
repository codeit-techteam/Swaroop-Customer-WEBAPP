import type { StoreApi } from "zustand";

import { useApprovalStore } from "@/store/approvalStore";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCreditApplicationStore } from "@/store/creditApplicationStore";
import { useCreditStore } from "@/store/creditStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useNotificationsCatalogStore } from "@/store/notificationsCatalogStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useOffersStore } from "@/store/offersStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useOrdersStore } from "@/store/ordersStore";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useProfileStore } from "@/store/profileStore";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import { useSupportStore } from "@/store/supportStore";

/**
 * Storage rehydration only runs once per page load, so a store that already
 * finished hydrating keeps `isHydrated` or pages would wait on it forever.
 */
function reset<T>(
  store: Pick<StoreApi<T>, "setState" | "getState" | "getInitialState">,
): void {
  const current = store.getState() as { isHydrated?: unknown };
  const next = { ...store.getInitialState() };
  if (typeof current.isHydrated === "boolean") {
    (next as { isHydrated?: boolean }).isHydrated = current.isHydrated;
  }
  store.setState(next, true);
}

/** Puts every customer-scoped store back to its initial (empty) state. */
export function resetCustomerStores(): void {
  reset(useApprovalStore);
  reset(useCartStore);
  reset(useCheckoutStore);
  reset(useCreditApplicationStore);
  reset(useCreditStore);
  reset(useDashboardStore);
  reset(useDocumentsStore);
  reset(useNotificationsCatalogStore);
  reset(useNotificationStore);
  reset(useOffersStore);
  reset(useOnboardingStore);
  reset(useOrdersCatalogStore);
  reset(useOrdersStore);
  reset(usePaymentsCatalogStore);
  reset(usePaymentStore);
  reset(useProfileStore);
  reset(usePurchaseRequestStore);
  reset(usePurchaseRequestTrackingStore);
  reset(useShipmentStore);
  reset(useShipmentTrackingStore);
  reset(useSupportStore);
}
