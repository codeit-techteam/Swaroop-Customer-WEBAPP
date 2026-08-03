"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPinned } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import {
  getRouteAfterDispatch,
  paymentPath,
} from "@/lib/order-journey-navigation";
import { createDispatchDetails, DISPATCH_COPY } from "@/mock/shipments";
import { useOrdersStore } from "@/store/ordersStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { DispatchInfoCard } from "./DispatchInfoCard";

interface DispatchDetailPageProps {
  orderId: string;
}

export function DispatchDetailPage({ orderId }: DispatchDetailPageProps) {
  const router = useRouter();
  const isHydrated = useOrdersStore((s) => s.isHydrated);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const catalog = useOrdersCatalogStore((s) =>
    s.items.find((o) => o.id === orderId),
  );
  const dispatch = useShipmentStore((s) => s.dispatchByOrder[orderId]);
  const initFromOrder = useShipmentStore((s) => s.initFromOrder);
  const startDispatch = useShipmentStore((s) => s.startDispatch);

  useEffect(() => {
    const finish = () => {
      useOrdersStore.getState().setHydrated(true);
      useOrdersCatalogStore.getState().setHydrated(true);
    };
    const unsub = useOrdersStore.persist.onFinishHydration(finish);
    if (useOrdersStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !order && !catalog) router.replace(ROUTES.ordersActive);
  }, [isHydrated, order, catalog, router]);

  useEffect(() => {
    if (order) initFromOrder(order);
  }, [order, initFromOrder]);

  const fallbackDispatch = useMemo(() => {
    if (dispatch) return dispatch;
    if (!catalog) return null;
    return {
      ...createDispatchDetails(
        catalog.id,
        catalog.warehouse,
        catalog.expectedDispatch ?? "Within 2 Days",
      ),
      vehicleNumber: catalog.vehicleNumber ?? "MH-04-AB-2291",
      driverName: catalog.driverName ?? "Rajesh Kumar",
      driverContactMasked: catalog.driverContact ?? "+91 ******8421",
      transportPartner: catalog.transporter ?? "Verified Logistics Partner",
      currentLocation: catalog.currentLocation ?? catalog.warehouse,
      loadingStatus: "Ready for Dispatch",
      dispatchTime: catalog.dispatchDate,
    };
  }, [dispatch, catalog]);

  if ((!order && !catalog) || !fallbackDispatch) return null;

  return (
    <PageContainer>
      <PageHeader
        title={DISPATCH_COPY.headerTitle}
        description={DISPATCH_COPY.subtitle}
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: orderId, href: `${ROUTES.orderDetail}/${orderId}` },
          { label: "Dispatch" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-4"
      >
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900">
            {DISPATCH_COPY.successTitle}
          </p>
        </div>

        <DispatchInfoCard dispatch={fallbackDispatch} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() =>
              router.push(
                order
                  ? paymentPath(orderId)
                  : `${ROUTES.orderDetail}/${orderId}`,
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            className="h-11 min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => {
              if (order) {
                startDispatch(orderId);
                toast.success("Shipment dispatched");
                router.push(getRouteAfterDispatch(orderId));
                return;
              }
              router.push(`${ROUTES.shipmentTracking}/${orderId}`);
            }}
          >
            <MapPinned className="h-4 w-4" />
            {DISPATCH_COPY.continueLabel}
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
