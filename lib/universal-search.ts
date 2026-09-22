import { ROUTES, documentsInvoicePath, documentsPoPath, paymentsDetailPath } from "@/constants";
import {
  getGradeSearchSuggestions,
  scoreMaterialMatch,
  scoreProductMatch,
  type GradeSearchSuggestions,
} from "@/lib/grade-search";
import type { MaterialTaxonomyItem } from "@/mock/materials-taxonomy";
import type {
  CertificateDocument,
  GstInvoiceDocument,
  InvoiceDocument,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
} from "@/types/documents";
import type { MarketplaceProduct } from "@/types/marketplace";
import type { OrdersCatalogItem } from "@/types/orders-catalog";
import type { PaymentRecord } from "@/types/payments";
import type { PurchaseRequestTrackingItem } from "@/types/purchase-request-tracking";
import type { ShipmentRecord } from "@/types/shipment-tracking";

export type UniversalSearchCategory =
  | "product"
  | "material"
  | "tax_invoice"
  | "gst_invoice"
  | "purchase_order"
  | "proforma"
  | "order"
  | "payment"
  | "purchase_request"
  | "shipment"
  | "certificate";

export type UniversalSearchResult = {
  id: string;
  category: UniversalSearchCategory;
  title: string;
  subtitle: string;
  href: string;
  score: number;
  badge?: string;
};

export type UniversalSearchGroup = {
  category: UniversalSearchCategory;
  label: string;
  results: UniversalSearchResult[];
};

export type UniversalSearchPayload = {
  query: string;
  groups: UniversalSearchGroup[];
  flat: UniversalSearchResult[];
  total: number;
  gradeSuggestions: GradeSearchSuggestions;
};

export const UNIVERSAL_CATEGORY_LABELS: Record<UniversalSearchCategory, string> = {
  product: "Grades & Products",
  material: "Materials",
  tax_invoice: "Tax Invoices",
  gst_invoice: "GST / Tax Invoices",
  purchase_order: "Purchase Orders",
  proforma: "Proforma Invoices",
  order: "Orders",
  payment: "Payments",
  purchase_request: "Purchase Requests",
  shipment: "Shipments",
  certificate: "Certificates",
};

const CATEGORY_LIMIT = 5;
const MAX_FLAT = 24;

function includesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query);
}

function scoreField(value: string | null | undefined, query: string): number {
  if (!value) return 0;
  const v = value.toLowerCase();
  const q = query.toLowerCase();
  if (v === q) return 100;
  if (v.startsWith(q)) return 80;
  if (v.includes(q)) return 50;
  return 0;
}

function scoreHaystack(parts: Array<string | number | null | undefined>, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  let best = 0;
  for (const part of parts) {
    if (part == null || part === "") continue;
    best = Math.max(best, scoreField(String(part), q));
  }
  return best;
}

function invoiceHaystack(inv: InvoiceDocument): Array<string | number | null | undefined> {
  return [
    inv.invoiceNumber,
    inv.orderNumber,
    inv.poNumber,
    inv.product,
    inv.grade,
    inv.seller,
    inv.warehouse,
    inv.buyer?.gstin,
    inv.sellerInfo?.gstin,
    inv.company?.gstin,
    inv.buyer?.name,
    inv.paymentStatus,
    inv.invoiceStatus,
    "tax invoice",
    "gst",
    "gstin",
    inv.gst > 0 ? "gst tax" : null,
    String(inv.gst),
  ];
}

function gstInvoiceHaystack(g: GstInvoiceDocument): Array<string | number | null | undefined> {
  return [
    g.invoiceNumber,
    g.gstNumber,
    g.orderNumber,
    g.poNumber,
    g.product,
    g.seller,
    g.warehouse,
    g.buyerGstin,
    g.sellerGstin,
    g.placeOfSupply,
    g.hsn,
    "gst",
    "gstin",
    "tax invoice",
    "cgst",
    "sgst",
    "igst",
  ];
}

export type UniversalSearchSources = {
  products: MarketplaceProduct[];
  materials: MaterialTaxonomyItem[];
  invoices: InvoiceDocument[];
  gstInvoices: GstInvoiceDocument[];
  purchaseOrders: PurchaseOrderDocument[];
  proformas: ProformaInvoiceDocument[];
  certificates: CertificateDocument[];
  orders: OrdersCatalogItem[];
  payments: PaymentRecord[];
  purchaseRequests: PurchaseRequestTrackingItem[];
  shipments: ShipmentRecord[];
};

export function getUniversalSearchResults(
  sources: UniversalSearchSources,
  query: string,
): UniversalSearchPayload {
  const q = query.trim();
  const gradeSuggestions = getGradeSearchSuggestions(
    sources.products,
    sources.materials,
    q,
  );

  if (!q) {
    return {
      query: q,
      groups: [],
      flat: [],
      total: 0,
      gradeSuggestions,
    };
  }

  const results: UniversalSearchResult[] = [];

  for (const material of gradeSuggestions.materials) {
    results.push({
      id: `material-${material.id}`,
      category: "material",
      title: material.code || material.name || "Material",
      subtitle: `${material.name ?? ""} · ${material.gradeCount ?? 0} grades`,
      href: `${ROUTES.marketplace}?search=${encodeURIComponent(material.code || material.name || "")}`,
      score: scoreMaterialMatch(material, q) + 8,
      badge: "Material",
    });
  }

  for (const product of gradeSuggestions.products) {
    results.push({
      id: `product-${product.id}`,
      category: "product",
      title: product.name || product.gradeCode || product.grade || "Product",
      subtitle: `${product.gradeCode ?? product.grade ?? "—"} · ${product.materialType ?? "—"}`,
      href: `${ROUTES.marketplaceProduct}/${product.id}`,
      score: scoreProductMatch(product, q) + 10,
      badge: product.casNumber ? `CAS ${product.casNumber}` : product.brandShortName,
    });
  }

  for (const inv of sources.invoices) {
    const score = scoreHaystack(invoiceHaystack(inv), q);
    if (score <= 0) continue;
    results.push({
      id: `tax-invoice-${inv.id}`,
      category: "tax_invoice",
      title: inv.invoiceNumber || inv.id,
      subtitle: `${inv.orderNumber ?? "—"} · ${inv.product ?? "Tax Invoice"} · GST ${inv.gst > 0 ? `₹${inv.gst}` : "included"}`,
      href: documentsInvoicePath(inv.id),
      score: score + 6,
      badge: "Tax Invoice",
    });
  }

  for (const g of sources.gstInvoices) {
    const score = scoreHaystack(gstInvoiceHaystack(g), q);
    if (score <= 0) continue;
    results.push({
      id: `gst-invoice-${g.id}`,
      category: "gst_invoice",
      title: g.invoiceNumber || g.id,
      subtitle: `GSTIN ${g.buyerGstin || g.sellerGstin || g.gstNumber || "—"} · ${g.product ?? "—"}`,
      href: g.id.startsWith("gst-")
        ? documentsInvoicePath(g.id.slice(4))
        : `${ROUTES.documentsInvoices}?search=${encodeURIComponent(g.invoiceNumber || "")}`,
      score: score + 12,
      badge: "GST",
    });
  }

  for (const po of sources.purchaseOrders) {
    const score = scoreHaystack(
      [
        po.poNumber,
        po.orderNumber,
        po.product,
        po.grade,
        po.seller,
        po.warehouse,
        po.buyer?.gstin,
        po.sellerInfo?.gstin,
        "purchase order",
        "po",
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `po-${po.id}`,
      category: "purchase_order",
      title: po.poNumber || po.id,
      subtitle: `${po.orderNumber ?? "—"} · ${po.product ?? "—"}`,
      href: documentsPoPath(po.id),
      score,
      badge: "PO",
    });
  }

  for (const pi of sources.proformas) {
    const score = scoreHaystack(
      [
        pi.proformaNumber,
        pi.orderNumber,
        pi.poNumber,
        pi.product,
        pi.grade,
        pi.seller,
        pi.warehouse,
        pi.buyer?.gstin,
        "proforma",
        "proforma invoice",
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `proforma-${pi.id}`,
      category: "proforma",
      title: pi.proformaNumber || pi.id,
      subtitle: `${pi.orderNumber ?? "—"} · ${pi.product ?? "—"}`,
      href: ROUTES.documentsProforma,
      score,
      badge: "Proforma",
    });
  }

  for (const cert of sources.certificates) {
    const score = scoreHaystack(
      [
        cert.name,
        cert.certificateNumber,
        cert.product,
        cert.grade,
        cert.orderNumber,
        cert.issuedBy,
        "certificate",
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `cert-${cert.id}`,
      category: "certificate",
      title: cert.name || cert.certificateNumber || cert.id,
      subtitle: `${cert.certificateNumber ?? "—"} · ${cert.product ?? "—"}`,
      href: ROUTES.documentsCertificates,
      score,
      badge: "Certificate",
    });
  }

  for (const order of sources.orders) {
    const score = scoreHaystack(
      [
        order.id,
        order.poNumber,
        order.productName,
        order.grade,
        order.sellerName,
        order.warehouse,
        order.invoiceNumber,
        order.ewayBillNumber,
        order.vehicleNumber,
        order.destination,
        "order",
        "gst",
        String(order.gstAmount ?? ""),
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `order-${order.id}`,
      category: "order",
      title: order.poNumber || order.id,
      subtitle: `${order.productName ?? "—"} · ${String(order.displayStatus ?? "order").replace(/_/g, " ")}`,
      href: `${ROUTES.orders}/${order.id}`,
      score,
      badge: "Order",
    });
  }

  for (const payment of sources.payments) {
    const score = scoreHaystack(
      [
        payment.paymentId,
        payment.orderNumber,
        payment.poNumber,
        payment.product,
        payment.productGrade,
        payment.seller,
        payment.warehouse,
        payment.invoiceNumber,
        payment.utrNumber,
        payment.transactionId,
        payment.receiptNumber,
        "payment",
        "gst",
        String(payment.gst ?? ""),
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `payment-${payment.id}`,
      category: "payment",
      title: payment.paymentId || payment.id,
      subtitle: `${payment.orderNumber ?? "—"} · ${payment.product ?? "—"}`,
      href: paymentsDetailPath(payment.id),
      score,
      badge: "Payment",
    });
  }

  for (const pr of sources.purchaseRequests) {
    const score = scoreHaystack(
      [
        pr.displayId,
        pr.id,
        pr.productName,
        pr.grade,
        pr.sellerName,
        pr.warehouse,
        "purchase request",
        "pr",
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `pr-${pr.id}`,
      category: "purchase_request",
      title: pr.displayId || pr.id,
      subtitle: `${pr.productName ?? "—"} · ${String(pr.status ?? "request").replace(/_/g, " ")}`,
      href: `${ROUTES.purchaseRequestsActive}?search=${encodeURIComponent(pr.displayId || pr.id)}`,
      score,
      badge: "PR",
    });
  }

  for (const shipment of sources.shipments) {
    const score = scoreHaystack(
      [
        shipment.id,
        shipment.orderNumber,
        shipment.poNumber,
        shipment.product,
        shipment.grade,
        shipment.vehicleNumber,
        shipment.transportCompany,
        shipment.destination,
        shipment.invoiceNumber,
        shipment.driverName,
        "shipment",
        "tracking",
        "gst",
        "tax invoice",
      ],
      q,
    );
    if (score <= 0) continue;
    results.push({
      id: `shipment-${shipment.id}`,
      category: "shipment",
      title: shipment.orderNumber || shipment.id,
      subtitle: `${shipment.product ?? "—"} · ${String(shipment.currentStatus ?? "shipment").replace(/_/g, " ")}`,
      href: `${ROUTES.shipmentTracking}/${shipment.id}`,
      score,
      badge: "Shipment",
    });
  }

  const sorted = [...results].sort((a, b) => b.score - a.score);
  const order: UniversalSearchCategory[] = [
    "gst_invoice",
    "tax_invoice",
    "product",
    "material",
    "purchase_order",
    "proforma",
    "order",
    "payment",
    "purchase_request",
    "shipment",
    "certificate",
  ];

  const groups: UniversalSearchGroup[] = [];
  for (const category of order) {
    const categoryResults = sorted
      .filter((item) => item.category === category)
      .slice(0, CATEGORY_LIMIT);
    if (categoryResults.length === 0) continue;
    groups.push({
      category,
      label: UNIVERSAL_CATEGORY_LABELS[category],
      results: categoryResults,
    });
  }

  const flat = sorted.slice(0, MAX_FLAT);

  return {
    query: q,
    groups,
    flat,
    total: sorted.length,
    gradeSuggestions,
  };
}

export function matchesUniversalInvoiceQuery(
  inv: InvoiceDocument,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return invoiceHaystack(inv).some((part) =>
    part != null && String(part).toLowerCase().includes(q),
  );
}

export function matchesUniversalGstInvoiceQuery(
  inv: GstInvoiceDocument,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return gstInvoiceHaystack(inv).some((part) =>
    part != null && String(part).toLowerCase().includes(q),
  );
}

const GST_QUERY_RE =
  /\b(gst|gstin|cgst|sgst|igst|tax\s*invoice|hsn)\b/i;

/** True when the query is clearly about GST / tax invoices. */
export function isGstRelatedQuery(query: string): boolean {
  return GST_QUERY_RE.test(query.trim());
}

/** Prefer documents hub when query is GST/tax oriented; otherwise marketplace. */
export function resolveUniversalFallbackHref(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return ROUTES.marketplace;
  if (isGstRelatedQuery(trimmed)) {
    return `${ROUTES.documentsInvoices}?search=${encodeURIComponent(trimmed)}`;
  }
  return `${ROUTES.marketplace}?search=${encodeURIComponent(trimmed)}`;
}

/** @deprecated kept for type compatibility with older imports */
export function includesErpKeyword(query: string): boolean {
  return includesQuery(
    "gst tax invoice gstin cgst sgst igst po payment order shipment",
    query.trim(),
  );
}
