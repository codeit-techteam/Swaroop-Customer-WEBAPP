"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  Gift,
  Package,
  Shield,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "@/types/notifications";
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_STATUS_LABELS,
  PRIORITY_COLORS,
} from "@/constants/notifications";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS: Partial<Record<NotificationType, LucideIcon>> = {
  purchase_request_submitted: ShoppingBag,
  seller_reviewing_request: ShoppingBag,
  seller_approved_request: BadgeCheck,
  seller_rejected_request: AlertTriangle,
  purchase_request_expired: AlertTriangle,
  purchase_order_generated: Package,
  purchase_order_ready: FileText,
  advance_payment_required: Wallet,
  payment_submitted: Wallet,
  utr_uploaded: CreditCard,
  payment_under_verification: Wallet,
  payment_approved: BadgeCheck,
  payment_failed: AlertTriangle,
  payment_received: Wallet,
  refund_initiated: Wallet,
  receipt_ready: FileText,
  credit_activated: CreditCard,
  shipment_created: Truck,
  truck_assigned: Truck,
  vehicle_assigned: Truck,
  driver_assigned: Truck,
  vehicle_dispatched: Truck,
  truck_left_warehouse: Truck,
  shipment_in_transit: Truck,
  reached_hub: Truck,
  reached_destination: Truck,
  shipment_delayed: AlertTriangle,
  shipment_delivered: BadgeCheck,
  dispatch_scheduled: Package,
  shipment_started: Truck,
  invoice_generated: FileText,
  gst_invoice_ready: FileText,
  certificates_uploaded: FileText,
  documents_available: FileText,
  quality_certificate_ready: FileText,
  lab_report_ready: FileText,
  transport_documents_uploaded: FileText,
  offer_available: Gift,
  flash_sale: Gift,
  festival_offer: Gift,
  bulk_discount: Gift,
  new_product_launch: Gift,
  credit_scheme: CreditCard,
  special_warehouse_offer: Gift,
  limited_time_pricing: Gift,
  credit_limit_increased: CreditCard,
  credit_limit_expiring: AlertTriangle,
  system_maintenance: Shield,
  account_verification: BadgeCheck,
  profile_updated: Shield,
  policy_update: Shield,
  security_alert: AlertTriangle,
  password_changed: Shield,
  gst_verified: BadgeCheck,
};

const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
  orders: Package,
  purchase_requests: ShoppingBag,
  seller_approval: BadgeCheck,
  payments: Wallet,
  shipment: Truck,
  documents: FileText,
  promotions: Gift,
  offers: Gift,
  marketplace: Gift,
  system: Shield,
};

export function getNotificationIcon(
  type: NotificationType,
  category: NotificationCategory,
): LucideIcon {
  return TYPE_ICONS[type] ?? CATEGORY_ICONS[category] ?? Bell;
}

export function NotificationTypeIcon({
  type,
  category,
  priority,
  className,
}: {
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  className?: string;
}) {
  const Icon = getNotificationIcon(type, category);
  const colors = PRIORITY_COLORS[priority];
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
        colors.bg,
        colors.border,
        className,
      )}
    >
      <Icon className={cn("h-5 w-5", colors.text)} />
    </div>
  );
}

export function StatusBadge({ status }: { status: NotificationStatus }) {
  const variant =
    status === "unread"
      ? "info"
      : status === "read"
        ? "secondary"
        : status === "archived"
          ? "outline"
          : "destructive";
  return (
    <Badge variant={variant} className="rounded-md font-medium">
      {NOTIFICATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CategoryBadge({
  category,
}: {
  category: NotificationCategory;
}) {
  return (
    <Badge
      variant="outline"
      className="rounded-md border-slate-200 font-medium text-slate-600"
    >
      {NOTIFICATION_CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: NotificationPriority;
}) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {NOTIFICATION_PRIORITY_LABELS[priority]}
    </span>
  );
}
