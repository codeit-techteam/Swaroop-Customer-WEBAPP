import apiClient from "@/lib/apiClient";
import { iso, num, paginateAll, type Envelope } from "@/lib/api-envelope";
import type {
  PaymentMethodId,
  PurchaseRequestStatus,
} from "@/types/purchase-request";
import type {
  PurchaseRequestTrackingItem,
  TrackingListStatus,
} from "@/types/purchase-request-tracking";

export type BackendPurchaseRequest = {
  id: string;
  referenceNumber: string;
  status: string;
  paymentMethod?: string | null;
  targetPrice?: unknown;
  currency?: string;
  destinationRegion?: string | null;
  remainingSeconds?: number | null;
  responseDeadline?: string | null;
  expiresAt?: string | null;
  poNumber?: string | null;
  purchaseOrder?: {
    referenceNumber?: string | null;
    status?: string | null;
  } | null;
  submittedAt?: string | null;
  createdAt?: string;
  rejectionReason?: string | null;
  supplier?: { displayName?: string | null };
  items?: Array<{
    id: string;
    quantity?: unknown;
    unit?: string;
    targetUnitPrice?: unknown;
    product?: { id?: string; name?: string } | null;
    grade?: {
      code?: string;
      name?: string;
      displayName?: string | null;
    } | null;
  }>;
};

function mapPaymentMethod(value?: string | null): PaymentMethodId {
  const key = (value ?? "").toUpperCase();
  if (key.includes("LOAD")) return "on_loading";
  if (key.includes("DELIV")) return "on_delivery";
  if (key.includes("30")) return "credit_30";
  if (key.includes("CREDIT")) return "credit_15";
  return "advance";
}

function mapTrackingStatus(status: string): TrackingListStatus {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "SUBMITTED":
      return "submitted";
    case "UNDER_REVIEW":
    case "SOURCING":
    case "OFFER_RECEIVED":
      return "seller_reviewing";
    case "NEGOTIATION":
    case "PENDING_APPROVAL":
      return "pending_approval";
    case "APPROVED":
    case "CONVERTED_TO_ORDER":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "EXPIRED":
      return "expired";
    case "CANCELLED":
      return "cancelled";
    case "WITHDRAWN":
      return "withdrawn";
    default:
      return "submitted";
  }
}

function mapRequestStatus(status: string): PurchaseRequestStatus {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "APPROVED":
    case "CONVERTED_TO_ORDER":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "EXPIRED":
      return "expired";
    case "CANCELLED":
    case "WITHDRAWN":
      return "withdrawn";
    default:
      return "pending_approval";
  }
}

export function mapPurchaseRequest(
  item: BackendPurchaseRequest,
): PurchaseRequestTrackingItem {
  const line = item.items?.[0];
  const quantity = num(line?.quantity);
  const unitPrice = num(line?.targetUnitPrice ?? item.targetPrice);
  const status = mapTrackingStatus(item.status);
  const paymentMethodId = mapPaymentMethod(item.paymentMethod);
  const deadlineIso = item.responseDeadline ?? item.expiresAt ?? null;
  return {
    id: item.id,
    displayId: item.referenceNumber,
    productId: line?.product?.id ?? item.id,
    productName:
      line?.product?.name ??
      line?.grade?.displayName ??
      line?.grade?.name ??
      "Grade",
    grade: line?.grade?.code ?? line?.grade?.name ?? "—",
    quantityMt: quantity,
    sellerName: item.supplier?.displayName ?? "ANONYMOUS SUPPLIER",
    warehouse: item.destinationRegion ?? "Assigned hub",
    createdAt: iso(item.createdAt),
    submittedAt: item.submittedAt ? iso(item.submittedAt) : iso(item.createdAt),
    approvedAt: status === "approved" ? iso(item.createdAt) : null,
    rejectedAt: status === "rejected" ? iso(item.createdAt) : null,
    expiredAt: status === "expired" ? iso(item.createdAt) : null,
    paymentMethodId,
    paymentMethodTitle:
      paymentMethodId === "credit_15" || paymentMethodId === "credit_30"
        ? "Credit — PetroTrade Managed"
        : paymentMethodId.replaceAll("_", " "),
    status,
    requestStatus: mapRequestStatus(item.status),
    expectedExpiryAt: deadlineIso ? iso(deadlineIso) : null,
    secondsRemaining: item.remainingSeconds ?? null,
    orderId: item.purchaseOrder?.referenceNumber ?? item.poNumber ?? null,
    poNumber: item.poNumber ?? item.purchaseOrder?.referenceNumber ?? null,
    orderStatus: item.purchaseOrder?.status ?? null,
    totalAmount: Math.round(quantity * unitPrice),
    rejectionReason: item.rejectionReason ?? null,
    rejectedBy: item.rejectionReason ? "Seller" : null,
    canCancel: [
      "submitted",
      "seller_reviewing",
      "pending_approval",
      "draft",
    ].includes(status),
  };
}

export async function fetchCustomerPurchaseRequests(): Promise<
  PurchaseRequestTrackingItem[]
> {
  const rows = await paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendPurchaseRequest[]>>(
      `/customer/purchase-requests?page=${page}&limit=50`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
  return rows.map(mapPurchaseRequest);
}

export type PurchaseRequestStatusPayload = {
  id: string;
  referenceNumber: string;
  status: string;
  expiresAt?: string | null;
  responseDeadline?: string | null;
  remainingSeconds?: number | null;
  allowedActions?: string[];
  submittedAt?: string | null;
  rejectionReason?: string | null;
};

export async function fetchPurchaseRequestStatus(
  id: string,
): Promise<PurchaseRequestStatusPayload> {
  const payload = await apiClient.get<Envelope<PurchaseRequestStatusPayload>>(
    `/customer/purchase-requests/${id}/status`,
  );
  if (!payload.data) throw new Error("Purchase request status unavailable");
  return payload.data;
}

export async function cancelCustomerPurchaseRequest(id: string) {
  await apiClient.post(`/customer/purchase-requests/${id}/cancel`);
}
