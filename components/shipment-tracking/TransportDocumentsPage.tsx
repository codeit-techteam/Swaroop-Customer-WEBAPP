"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { OrdersPageSkeleton } from "@/components/orders/orders-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { downloadShipmentDocumentsZip } from "@/lib/shipment-documents";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { TransportDocumentsTable } from "./TransportDocumentsTable";

export function TransportDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const shipments = useShipmentTrackingStore((s) => s.shipments);
  const selectedId = useShipmentTrackingStore((s) => s.selectedId);
  const setSelectedId = useShipmentTrackingStore((s) => s.setSelectedId);
  const markDocumentDownloaded = useShipmentTrackingStore(
    (s) => s.markDocumentDownloaded,
  );
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (queryId) setSelectedId(queryId);
    else if (!selectedId && shipments[0]) setSelectedId(shipments[0].id);
  }, [queryId, selectedId, shipments, setSelectedId]);

  const activeId = queryId || selectedId || shipments[0]?.id;
  const shipment = useMemo(
    () => shipments.find((s) => s.id === activeId),
    [shipments, activeId],
  );

  if (!isHydrated) {
    return (
      <PageContainer>
        <OrdersPageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Transport Documents"
        description="Invoice, e-way bill, challan, LR copy, packing list, and transport receipt for each shipment."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Transport Documents" },
        ]}
        actions={
          shipment ? (
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                downloadShipmentDocumentsZip(shipment);
                toast.success("All generated documents downloaded");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          ) : null
        }
      />

      <Select
        value={activeId}
        onValueChange={(id) => {
          setSelectedId(id);
          router.replace(
            `${ROUTES.shipmentTransportDocuments}?id=${encodeURIComponent(id)}`,
          );
        }}
      >
        <SelectTrigger className="max-w-md rounded-xl">
          <SelectValue placeholder="Select shipment" />
        </SelectTrigger>
        <SelectContent>
          {shipments.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.orderNumber} · {s.invoiceNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {shipment ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Documents · {shipment.orderNumber}
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Preview, download, or print dummy transport files
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => router.push(shipmentDetailPath(shipment.id))}
              >
                Track Shipment
              </Button>
            </CardHeader>
            <CardContent>
              <TransportDocumentsTable
                shipment={shipment}
                onDownloaded={(docId) =>
                  markDocumentDownloaded(shipment.id, docId)
                }
              />
            </CardContent>
          </Card>
          <OrderSummarySidebar shipment={shipment} />
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Select a shipment to view documents.
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
