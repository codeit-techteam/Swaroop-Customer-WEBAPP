"use client";

import { useRouter } from "next/navigation";
import { Download, Eye, Headset, MapPinned, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { formatDateDdMmYyyy, formatQuantityMt } from "@/lib/format";
import { downloadShipmentDocumentsZip } from "@/lib/shipment-documents";
import { ShipmentStatusChip } from "./ShipmentStatusChip";
import type { ShipmentRecord } from "@/types/shipment-tracking";

interface ShipmentCardProps {
  shipment: ShipmentRecord;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
  const router = useRouter();
  const detailHref = shipmentDetailPath(shipment.id);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-card transition hover:border-brand/30 hover:shadow-elevated">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-sky-50/70 to-white pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-900">
              {shipment.product}
            </CardTitle>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {shipment.orderNumber} · {shipment.poNumber} ·{" "}
              {formatQuantityMt(shipment.quantityMt)}
            </p>
          </div>
          <ShipmentStatusChip status={shipment.currentStatus} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Seller" value={shipment.seller} />
          <Meta label="Warehouse" value={shipment.warehouse} />
          <Meta
            label="Destination"
            value={`${shipment.destination}, ${shipment.destinationState}`}
          />
          <Meta label="Transport" value={shipment.transportCompany} />
          <Meta label="Vehicle" value={shipment.vehicleNumber} mono />
          <Meta label="Driver" value={shipment.driverName} />
          <Meta
            label="Dispatch"
            value={
              shipment.dispatchDate
                ? formatDateDdMmYyyy(shipment.dispatchDate)
                : "Pending"
            }
          />
          <Meta label="ETA" value={formatDateDdMmYyyy(shipment.eta)} />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Navigation className="h-3.5 w-3.5 text-brand" />
              {shipment.currentCity} → {shipment.destination}
            </span>
            <span>
              {shipment.remainingDistanceKm > 0
                ? `${shipment.remainingDistanceKm.toLocaleString("en-IN")} km remaining`
                : "Arrived"}
            </span>
          </div>
          <Progress value={shipment.progress} className="h-2" />
          <p className="mt-2 text-xs text-slate-500">
            Progress {shipment.progress}% · {shipment.remainingHours}h remaining
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => router.push(detailHref)}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Track Shipment
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push(detailHref)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              downloadShipmentDocumentsZip(shipment);
              toast.success("Transport documents download started");
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Documents
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl"
            onClick={() =>
              toast.message("Support ticket opened for this shipment")
            }
          >
            <Headset className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-0.5 font-mono text-sm font-medium text-slate-800"
            : "mt-0.5 text-sm font-medium text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}
