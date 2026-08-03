"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ShipmentRecord } from "@/types/shipment-tracking";

interface OrderSummarySidebarProps {
  shipment: ShipmentRecord;
  className?: string;
}

export function OrderSummarySidebar({
  shipment,
  className,
}: OrderSummarySidebarProps) {
  const rows = [
    { label: "Order Number", value: shipment.orderNumber, mono: true },
    { label: "PO", value: shipment.poNumber, mono: true },
    { label: "Invoice", value: shipment.invoiceNumber, mono: true },
    { label: "Product", value: `${shipment.product} (${shipment.grade})` },
    { label: "Quantity", value: formatQuantityMt(shipment.quantityMt) },
    { label: "Warehouse", value: shipment.warehouse },
    { label: "Payment Type", value: shipment.paymentType },
    {
      label: "Grand Total",
      value: formatInr(shipment.grandTotal),
      emphasize: true,
    },
  ];

  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {row.label}
            </span>
            <span
              className={cn(
                "max-w-[60%] text-right text-sm font-medium text-slate-800",
                row.mono && "font-mono text-xs",
                row.emphasize && "text-base font-semibold text-brand",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
