"use client";

import { cn } from "@/lib/utils";
import { SHIPMENT_STATUS_CHIP } from "@/constants/shipment-tracking";
import type { ShipmentStatus } from "@/types/shipment-tracking";

interface ShipmentStatusChipProps {
  status: ShipmentStatus;
  className?: string;
  /** Use short chip labels (Ready / Transit) vs full labels */
  compact?: boolean;
}

export function ShipmentStatusChip({
  status,
  className,
  compact = true,
}: ShipmentStatusChipProps) {
  const meta = SHIPMENT_STATUS_CHIP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        meta.className,
        className,
      )}
    >
      {compact ? meta.label : meta.label}
    </span>
  );
}
