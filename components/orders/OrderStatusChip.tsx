"use client";

import { cn } from "@/lib/utils";
import { ordersDisplayStatusLabel } from "@/mock/orders-catalog";
import type { OrdersDisplayStatus } from "@/types/orders-catalog";

const STATUS_CLASS: Record<OrdersDisplayStatus, string> = {
  processing: "bg-amber-50 text-amber-800 border-amber-200",
  packed: "bg-amber-50 text-amber-800 border-amber-200",
  ready: "bg-sky-50 text-sky-800 border-sky-200",
  in_transit: "bg-indigo-50 text-indigo-800 border-indigo-200",
  delayed: "bg-red-50 text-red-800 border-red-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

interface OrderStatusChipProps {
  status: OrdersDisplayStatus;
  className?: string;
}

export function OrderStatusChip({ status, className }: OrderStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      {ordersDisplayStatusLabel(status)}
    </span>
  );
}
