"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { formatQuantityMt } from "@/lib/format";
import { formatShipmentDate } from "@/lib/shipment-mvp";
import { ShipmentProgressTracker } from "./ShipmentProgressTracker";
import { ShipmentStatusChip } from "./ShipmentStatusChip";
import type { ShipmentRecord } from "@/types/shipment-tracking";

interface ShipmentCardProps {
  shipment: ShipmentRecord;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
  const router = useRouter();
  const [showProgress, setShowProgress] = useState(false);
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
          <Meta label="Order Number" value={shipment.orderNumber} mono />
          <Meta label="PO Number" value={shipment.poNumber} mono />
          <Meta
            label="Quantity"
            value={formatQuantityMt(shipment.quantityMt)}
          />
          <Meta label="Warehouse" value={shipment.warehouse} />
          <Meta
            label="Destination"
            value={`${shipment.destination}, ${shipment.destinationState}`}
          />
          <Meta label="Transporter" value={shipment.transportCompany} />
          <Meta label="Vehicle Number" value={shipment.vehicleNumber} mono />
          <Meta
            label="Dispatch Date"
            value={formatShipmentDate(shipment.dispatchDate)}
          />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shipment Progress
          </p>
          <ShipmentProgressTracker status={shipment.currentStatus} />
        </div>

        {showProgress ? (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <ShipmentProgressTracker
              status={shipment.currentStatus}
              variant="vertical"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => router.push(detailHref)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowProgress((v) => !v)}
          >
            <ListTree className="mr-2 h-4 w-4" />
            View Shipment Progress
            {showProgress ? (
              <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            )}
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
