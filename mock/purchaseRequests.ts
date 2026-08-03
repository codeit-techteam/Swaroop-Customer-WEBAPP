import type { PurchaseRequestSummary } from "@/types/dashboard";

/**
 * Active purchase requests / post-approval orders for dashboard table.
 * Flow: Purchase Request → 15-min seller approval → Order generated.
 */
export const purchaseRequestsMock: PurchaseRequestSummary[] = [
  {
    id: "pr-99231",
    displayId: "#PR-99231",
    material: "PP Raffia Grade",
    materialDetail: "Standard Packaging",
    quantityMt: 24.5,
    status: "in_transit",
    orderId: "PT-ORD-99231",
    createdAt: "2026-07-28T08:30:00.000Z",
  },
  {
    id: "pr-99104",
    displayId: "#PR-99104",
    material: "HDPE Film Grade",
    materialDetail: "Bulk Jumbo Bags",
    quantityMt: 110,
    status: "pending_seller_approval",
    orderId: null,
    createdAt: "2026-07-31T09:45:00.000Z",
  },
  {
    id: "pr-98822",
    displayId: "#PR-98822",
    material: "PVC Pipe Grade",
    materialDetail: "Factory Direct",
    quantityMt: 45,
    status: "processing",
    orderId: "PT-ORD-98822",
    createdAt: "2026-07-26T11:20:00.000Z",
  },
];
