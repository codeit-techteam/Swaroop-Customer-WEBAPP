"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { trackingStatusLabel } from "@/mock/purchase-request/trackingRequests";
import type { TrackingListStatus } from "@/types/purchase-request-tracking";

interface TrackingStatusBadgeProps {
  status: TrackingListStatus;
}

export function TrackingStatusBadge({ status }: TrackingStatusBadgeProps) {
  return <StatusBadge status={status} label={trackingStatusLabel(status)} />;
}
