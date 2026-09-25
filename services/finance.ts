import apiClient from "@/lib/apiClient";
import { iso, num, paginateAll, type Envelope } from "@/lib/api-envelope";
import type {
  OrdersCatalogItem,
  OrdersDisplayStatus,
} from "@/types/orders-catalog";
import type {
  InvoiceRecord,
  PaymentRecord,
  PaymentStatus,
  PaymentTypeId,
  ReceiptRecord,
} from "@/types/payments";
import type {
  DocumentPricing,
  InvoiceDocument,
  PartyInfo,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
} from "@/types/documents";

const BLANK_PARTY: PartyInfo = {
  name: "—",
  gstin: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  contactPerson: "",
  phone: "",
  email: "",
};

function pricing(amount: number): DocumentPricing {
  return {
    unitPrice: amount,
    quantityMt: 0,
    taxableValue: amount,
    gstRate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    freight: 0,
    insurance: 0,
    grandTotal: amount,
  };
}

export type BackendPurchaseOrder = {
  id: string;
  referenceNumber?: string;
  orderNumber?: string;
  status: string;
  backendStatus?: string;
  presentationBucket?: "ACTIVE" | "COMPLETED" | "CANCELLED";
  paymentMethod?: string | null;
  currency?: string;
  totalAmount?: unknown;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  gradeName?: string;
  categoryCode?: string | null;
  quantity?: number;
  unit?: string;
  items?: Array<{
    productId?: string | null;
    productName?: string;
    gradeName?: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
  }>;
  payment?: {
    paymentOption?: string | null;
    paymentOptionLabel?: string;
    paymentStatus?: string;
    verifiedByPetroTrade?: boolean;
    amountPaid?: string;
    amountDue?: string;
  };
  progress?: {
    percentage?: number;
    stage?: string;
    label?: string;
  };
  procurement?: { status?: string | null };
  dispatch?: { status?: string | null };
  shipment?: {
    status?: string | null;
    estimatedDeliveryDate?: string | null;
  };
  delivery?: { status?: string | null; deliveredAt?: string | null };
  amounts?: {
    subtotal?: string;
    taxAmount?: string;
    totalAmount?: string;
  };
};

export type BackendPayment = {
  id: string;
  referenceNumber: string;
  purchaseOrderId?: string | null;
  method?: string | null;
  rail?: string | null;
  status: string;
  amount?: unknown;
  pendingAmount?: unknown;
  utr?: string | null;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  createdAt?: string;
};

export type BackendProforma = {
  id: string;
  piNumber?: string;
  status?: string;
  totalAmount?: unknown;
  paidAmount?: unknown;
  remainingAmount?: unknown;
  createdAt?: string;
  purchaseOrderId?: string | null;
  paymentMethod?: string | null;
};

function mapPaymentType(value?: string | null): PaymentTypeId {
  const key = (value ?? "").toUpperCase();
  if (key.includes("LOAD")) return "on_loading";
  if (key.includes("DELIV")) return "on_delivery";
  if (key.includes("30")) return "credit_30";
  if (key.includes("CREDIT")) return "credit_15";
  return "advance";
}

function mapPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "VERIFIED":
    case "CLEARED":
    case "PAID":
      return "verified";
    case "SUBMITTED":
      return "payment_submitted";
    case "UNDER_REVIEW":
      return "verification_pending";
    case "REJECTED":
      return "rejected";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    case "OVERDUE":
      return "overdue";
    default:
      return "pending";
  }
}

function mapOrderStatus(
  status: string,
  bucket?: string,
  shipmentStatus?: string | null,
): OrdersDisplayStatus {
  const b = (bucket ?? "").toUpperCase();
  if (b === "CANCELLED" || status.toUpperCase().includes("CANCEL"))
    return "cancelled";
  if (b === "COMPLETED" || status.toUpperCase().includes("DELIVER"))
    return "delivered";
  const ship = (shipmentStatus ?? "").toUpperCase();
  if (
    ship.includes("TRANSIT") ||
    ship.includes("DISPATCH") ||
    status.toUpperCase().includes("TRANSIT")
  ) {
    return "in_transit";
  }
  if (
    status.toUpperCase().includes("READY") ||
    status.toUpperCase().includes("DISPATCH")
  )
    return "ready";
  return "processing";
}

export function mapPurchaseOrder(
  item: BackendPurchaseOrder,
): OrdersCatalogItem {
  const paymentOption = item.payment?.paymentOption ?? item.paymentMethod;
  const paymentMethodId = mapPaymentType(paymentOption);
  const displayStatus = mapOrderStatus(
    item.status,
    item.presentationBucket,
    item.shipment?.status,
  );
  const primary = item.items?.[0];
  const total = num(
    item.amounts?.totalAmount ?? item.totalAmount ?? primary?.totalAmount,
  );
  const quantity = num(item.quantity ?? primary?.quantity);
  const unitPrice = quantity > 0 ? total / quantity : num(primary?.unitPrice);
  const progress =
    typeof item.progress?.percentage === "number"
      ? item.progress.percentage
      : displayStatus === "delivered"
        ? 100
        : displayStatus === "in_transit"
          ? 75
          : displayStatus === "ready"
            ? 75
            : 25;
  const paymentStatus =
    item.payment?.verifiedByPetroTrade ||
    ["VERIFIED", "PAID", "AUTHORIZED"].includes(
      (item.payment?.paymentStatus ?? "").toUpperCase(),
    )
      ? "verified"
      : "pending";
  const poNumber = item.orderNumber ?? item.referenceNumber ?? item.id;
  const createdAt = iso(item.createdAt);

  return {
    id: item.id,
    poNumber,
    productId: primary?.productId ?? item.id,
    productName: item.productName ?? primary?.productName ?? "Material",
    grade: item.gradeName ?? primary?.gradeName ?? "—",
    productImageUrl: "",
    sellerName: "Supply Assigned",
    warehouse: "Assigned hub",
    quantityMt: quantity,
    pricePerMt: unitPrice,
    gstAmount: num(item.amounts?.taxAmount),
    freightAmount: 0,
    insuranceAmount: 0,
    grandTotal: total,
    paymentMethodId,
    paymentMethodTitle:
      item.payment?.paymentOptionLabel ??
      (paymentMethodId === "credit_15" || paymentMethodId === "credit_30"
        ? "Credit — PetroTrade Managed"
        : paymentMethodId.replaceAll("_", " ")),
    paymentStatus: displayStatus === "cancelled" ? "pending" : paymentStatus,
    displayStatus,
    progress,
    expectedDelivery: (item.shipment?.estimatedDeliveryDate ?? createdAt).slice(
      0,
      10,
    ),
    createdAt,
    updatedAt: iso(item.updatedAt ?? item.createdAt),
    destination: "Assigned destination",
    currentLocation: null,
    distanceRemainingKm: null,
    etaLabel: item.progress?.label ?? "As scheduled",
    vehicleNumber: null,
    transporter: null,
    driverName: null,
    driverContact: null,
    loadingSlot: null,
    dispatchDate: null,
    packingTeam: null,
    processingPercent: progress,
    estimatedCompletion: null,
    expectedDispatch: null,
    deliveredAt:
      displayStatus === "delivered"
        ? iso(item.delivery?.deliveredAt ?? item.updatedAt ?? item.createdAt)
        : null,
    receiverName: null,
    invoiceNumber: null,
    ewayBillNumber: null,
    podId: null,
    cancelledAt:
      displayStatus === "cancelled"
        ? iso(item.updatedAt ?? item.createdAt)
        : null,
    cancellationReason: null,
    cancelledBy: null,
    refundStatus: null,
    previousPricePerMt: null,
    currentPricePerMt: unitPrice,
    availability: "in_stock",
    deliveryType: "road",
    timeline: [
      { id: "1", title: "PO Generated", status: "completed", at: createdAt },
      {
        id: "2",
        title: item.progress?.label ?? "Processing",
        status: displayStatus === "processing" ? "current" : "completed",
        at: null,
      },
      {
        id: "3",
        title: "Dispatched",
        status:
          displayStatus === "in_transit" || displayStatus === "delivered"
            ? "completed"
            : displayStatus === "ready"
              ? "current"
              : "pending",
        at: null,
      },
      {
        id: "4",
        title: "Delivered",
        status: displayStatus === "delivered" ? "completed" : "pending",
        at:
          displayStatus === "delivered"
            ? iso(item.delivery?.deliveredAt ?? item.updatedAt)
            : null,
      },
    ],
  };
}

export function mapPayment(item: BackendPayment): PaymentRecord {
  const amount = num(item.amount);
  const remaining = num(item.pendingAmount, amount);
  const status = mapPaymentStatus(item.status);
  const paymentType = mapPaymentType(item.method);
  return {
    id: item.id,
    paymentId: item.referenceNumber,
    orderNumber: item.purchaseOrderId ?? item.referenceNumber,
    poNumber: item.purchaseOrderId ?? item.referenceNumber,
    product: "Purchase order",
    seller: "ANONYMOUS SUPPLIER",
    warehouse: "Assigned hub",
    quantityMt: 0,
    paymentType,
    amount,
    gst: 0,
    freight: 0,
    insurance: 0,
    totalAmount: amount,
    amountPaid: Math.max(0, amount - remaining),
    remainingBalance: remaining,
    status,
    paymentDate: item.verifiedAt
      ? iso(item.verifiedAt)
      : item.submittedAt
        ? iso(item.submittedAt)
        : undefined,
    dueDate: iso(item.createdAt),
    utrNumber: item.utr ?? undefined,
    paymentMethod: (item.rail as PaymentRecord["paymentMethod"]) ?? "NEFT",
    verifiedAt: item.verifiedAt ? iso(item.verifiedAt) : undefined,
    timeline: [],
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.verifiedAt ?? item.createdAt),
  };
}

export function mapPaymentToInvoice(item: BackendPayment): InvoiceRecord {
  const payment = mapPayment(item);
  return {
    id: item.id,
    invoiceNumber: item.referenceNumber,
    orderNumber: payment.orderNumber,
    poNumber: payment.poNumber,
    paymentId: payment.paymentId,
    product: payment.product,
    seller: payment.seller,
    warehouse: payment.warehouse,
    amount: payment.amount,
    gst: 0,
    freight: 0,
    insurance: 0,
    totalAmount: payment.totalAmount,
    issueDate: payment.createdAt,
    status:
      payment.status === "verified"
        ? "paid"
        : payment.status === "cancelled"
          ? "cancelled"
          : "issued",
    paymentType: payment.paymentType,
    transactionId: item.referenceNumber,
    utrNumber: item.utr ?? undefined,
    verificationDate: item.verifiedAt ? iso(item.verifiedAt) : undefined,
  };
}

export function mapPaymentToReceipt(
  item: BackendPayment,
): ReceiptRecord | null {
  if (!item.utr && item.status !== "VERIFIED" && item.status !== "CLEARED") {
    return null;
  }
  const payment = mapPayment(item);
  return {
    id: item.id,
    receiptNumber: `RCT-${item.referenceNumber}`,
    paymentId: payment.paymentId,
    orderNumber: payment.orderNumber,
    poNumber: payment.poNumber,
    invoiceNumber: item.referenceNumber,
    transactionId: item.referenceNumber,
    utrNumber: item.utr ?? undefined,
    amount: payment.amount,
    gst: 0,
    totalAmount: payment.totalAmount,
    paymentMethod: payment.paymentMethod ?? "NEFT",
    paymentType: payment.paymentType,
    paymentDate: payment.paymentDate ?? payment.createdAt,
    verificationDate: payment.verifiedAt,
    status: "generated",
    seller: payment.seller,
    warehouse: payment.warehouse,
  };
}

export function mapPoToDocument(
  item: BackendPurchaseOrder,
): PurchaseOrderDocument {
  const amount = num(item.totalAmount);
  return {
    id: item.id,
    poNumber: item.referenceNumber ?? item.id,
    orderNumber: item.referenceNumber ?? item.id,
    product: "Purchase order",
    grade: "—",
    seller: "ANONYMOUS SUPPLIER",
    warehouse: "Assigned hub",
    quantityMt: 0,
    poDate: iso(item.createdAt),
    amount,
    status: item.status === "CANCELLED" ? "cancelled" : "generated",
    buyer: { ...BLANK_PARTY, name: "Your company" },
    sellerInfo: { ...BLANK_PARTY, name: "ANONYMOUS SUPPLIER" },
    lineItems: [],
    pricing: pricing(amount),
    paymentTerms: item.paymentMethod ?? "ADVANCE",
    deliveryTerms: "As agreed",
    approval: {
      approvedBy: "System",
      approvedAt: iso(item.createdAt),
      remarks: "",
    },
    timeline: [
      {
        id: "created",
        label: "Created",
        at: iso(item.createdAt),
        status: "completed",
      },
    ],
  };
}

export function mapProformaToDocument(
  item: BackendProforma,
): ProformaInvoiceDocument {
  const amount = num(item.totalAmount);
  return {
    id: item.id,
    proformaNumber: item.piNumber ?? item.id,
    product: "Proforma invoice",
    grade: "—",
    orderNumber: item.purchaseOrderId ?? item.id,
    poNumber: item.purchaseOrderId ?? item.id,
    amount,
    createdDate: iso(item.createdAt),
    expiryDate: iso(item.createdAt),
    status:
      item.status === "CANCELLED"
        ? "cancelled"
        : item.status === "PAID"
          ? "converted"
          : "active",
    docStatus: item.status === "CANCELLED" ? "cancelled" : "generated",
    seller: "ANONYMOUS SUPPLIER",
    warehouse: "Assigned hub",
    buyer: { ...BLANK_PARTY, name: "Your company" },
    sellerInfo: { ...BLANK_PARTY, name: "ANONYMOUS SUPPLIER" },
    lineItems: [],
    pricing: pricing(amount),
    paymentTerms: item.paymentMethod ?? "ADVANCE",
    validityNote: "Valid until converted or cancelled",
  };
}

export function mapProformaToInvoice(item: BackendProforma): InvoiceDocument {
  const amount = num(item.totalAmount);
  const paid = item.status === "PAID";
  return {
    id: item.id,
    invoiceNumber: item.piNumber ?? item.id,
    orderNumber: item.purchaseOrderId ?? item.id,
    poNumber: item.purchaseOrderId ?? item.id,
    invoiceDate: iso(item.createdAt),
    amount,
    gst: 0,
    totalAmount: amount,
    paymentStatus: paid ? "paid" : "unpaid",
    invoiceStatus: paid ? "paid" : "generated",
    status: "generated",
    product: "Tax Invoice",
    grade: "—",
    seller: "ANONYMOUS SUPPLIER",
    warehouse: "Assigned hub",
    company: {
      ...BLANK_PARTY,
      name: "PetroTrade Technologies Pvt Ltd",
      gstin: "27AABCP4821Q1ZV",
      state: "Maharashtra",
    },
    buyer: {
      ...BLANK_PARTY,
      name: "Your company",
      gstin: "27AABCT1332L1ZV",
      state: "Maharashtra",
    },
    sellerInfo: {
      ...BLANK_PARTY,
      name: "ANONYMOUS SUPPLIER",
      gstin: "27AABCS1429B1ZM",
      state: "Maharashtra",
    },
    lineItems: [],
    pricing: pricing(amount),
    paymentInfo: {
      method: item.paymentMethod ?? "ADVANCE",
      dueDate: iso(item.createdAt),
    },
    timeline: [
      {
        id: "created",
        label: "Issued",
        at: iso(item.createdAt),
        status: "completed",
      },
    ],
  };
}

export async function fetchCustomerPurchaseOrders(): Promise<
  BackendPurchaseOrder[]
> {
  return paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendPurchaseOrder[]>>(
      `/customer/orders?page=${page}&limit=50`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
}

export async function fetchCustomerOrderById(
  id: string,
): Promise<BackendPurchaseOrder | null> {
  try {
    const payload = await apiClient.get<Envelope<BackendPurchaseOrder>>(
      `/customer/orders/${id}`,
    );
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchCustomerOrderTimeline(id: string) {
  const payload = await apiClient.get<
    Envelope<{ events: Array<{ at: string; type: string; label: string }> }>
  >(`/customer/orders/${id}/timeline`);
  return payload.data;
}

export async function fetchCustomerOrdersSummary() {
  const payload = await apiClient.get<
    Envelope<{
      activeOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      pendingPayments: number;
      inTransit: number;
    }>
  >("/customer/orders/summary");
  return payload.data;
}

export async function fetchCustomerPayments(): Promise<BackendPayment[]> {
  return paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendPayment[]>>(
      `/customer/payments?page=${page}&limit=50`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
}

export async function fetchCustomerProformas(): Promise<BackendProforma[]> {
  return paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendProforma[]>>(
      `/customer/proforma-invoices?page=${page}&limit=50`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
}

export async function submitCustomerUtr(paymentId: string, utrNumber: string) {
  await apiClient.post(`/customer/payments/${paymentId}/utr`, { utrNumber });
}
