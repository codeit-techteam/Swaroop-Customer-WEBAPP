/**
 * Documents catalog mock — realistic B2B petrochemical procurement documents.
 * All documents are linked to shared order numbers across the lifecycle.
 */

import {
  BUYER_COMPANY,
  DOCUMENT_PRODUCTS,
  DOCUMENT_SELLERS,
  DOCUMENT_WAREHOUSES,
  PLATFORM_COMPANY,
  documentsInvoicePath,
  documentsPoPath,
} from "@/constants/documents";
import type {
  CertificateDocument,
  DocumentLineItem,
  DocumentNotification,
  DocumentPricing,
  DocumentStatus,
  DocumentTimelineEvent,
  DocumentsFiltersState,
  DownloadableDocument,
  InvoiceDocument,
  PartyInfo,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
  RecentlyGeneratedItem,
} from "@/types/documents";

/** Blind marketplace: all document parties resolve to PetroTrade. */

function pad(n: number, width = 4) {
  return String(n).padStart(width, "0");
}

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date("2026-08-03T12:00:00+05:30");
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 7) % 60, 0, 0);
  return d.toISOString();
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function sellerParty(_seller?: (typeof DOCUMENT_SELLERS)[number]): PartyInfo {
  return {
    name: PLATFORM_COMPANY.name,
    gstin: PLATFORM_COMPANY.gstin,
    address: PLATFORM_COMPANY.address,
    city: PLATFORM_COMPANY.city,
    state: PLATFORM_COMPANY.state,
    pincode: PLATFORM_COMPANY.pincode,
    contactPerson: PLATFORM_COMPANY.contactPerson,
    phone: PLATFORM_COMPANY.phone,
    email: PLATFORM_COMPANY.email,
  };
}

function buildLineItem(
  id: string,
  productIdx: number,
  quantityMt: number,
  unitPrice: number,
): DocumentLineItem {
  const product = DOCUMENT_PRODUCTS[productIdx % DOCUMENT_PRODUCTS.length];
  const taxableValue = quantityMt * unitPrice;
  const gstRate = 18;
  const gstAmount = Math.round(taxableValue * (gstRate / 100));
  return {
    id,
    product: product.name,
    grade: product.grade,
    hsn: product.hsn,
    quantityMt,
    unitPrice,
    taxableValue,
    gstRate,
    gstAmount,
    total: taxableValue + gstAmount,
  };
}

function buildPricing(
  quantityMt: number,
  unitPrice: number,
  interstate: boolean,
): DocumentPricing {
  const taxableValue = quantityMt * unitPrice;
  const gstRate = 18;
  const gstTotal = Math.round(taxableValue * (gstRate / 100));
  const freight = Math.round(quantityMt * 850);
  const insurance = Math.round(taxableValue * 0.0025);
  const cgst = interstate ? 0 : Math.round(gstTotal / 2);
  const sgst = interstate ? 0 : Math.round(gstTotal / 2);
  const igst = interstate ? gstTotal : 0;
  return {
    unitPrice,
    quantityMt,
    taxableValue,
    gstRate,
    cgst,
    sgst,
    igst,
    freight,
    insurance,
    grandTotal: taxableValue + gstTotal + freight + insurance,
  };
}

function lifecycleTimeline(
  baseDate: string,
  stage: number,
): DocumentTimelineEvent[] {
  const steps = [
    "Purchase Order Generated",
    "Invoice Generated",
    "Payment Completed",
    "Receipt Generated",
    "Shipment Documents Ready",
    "Delivery Completed",
    "Certificate Issued",
  ];
  return steps.map((label, i) => {
    const at = addDaysIso(baseDate, i * 2);
    let status: DocumentTimelineEvent["status"] = "upcoming";
    if (i < stage) status = "completed";
    else if (i === stage) status = "current";
    return {
      id: `tl-${i + 1}`,
      label,
      description:
        status === "completed"
          ? `${label} on schedule`
          : status === "current"
            ? "In progress"
            : "Awaiting prior milestone",
      at,
      status,
    };
  });
}

type OrderSeed = {
  index: number;
  orderNumber: string;
  poNumber: string;
  invoiceNumber: string;
  proformaNumber: string;
  seller: (typeof DOCUMENT_SELLERS)[number];
  warehouse: (typeof DOCUMENT_WAREHOUSES)[number];
  productIdx: number;
  quantityMt: number;
  unitPrice: number;
  poDate: string;
  interstate: boolean;
  stage: number; // 0-7 lifecycle completeness
  poStatus: DocumentStatus;
  invStatus: DocumentStatus;
};

function buildSeeds(): OrderSeed[] {
  const seeds: OrderSeed[] = [];
  for (let i = 1; i <= 25; i++) {
    const seller = DOCUMENT_SELLERS[(i - 1) % DOCUMENT_SELLERS.length];
    const warehouse = DOCUMENT_WAREHOUSES[(i - 1) % DOCUMENT_WAREHOUSES.length];
    const productIdx = (i - 1) % DOCUMENT_PRODUCTS.length;
    const quantityMt = 20 + ((i * 7) % 80);
    const unitPrice = 82_000 + ((i * 1300) % 25_000);
    const poDate = isoDaysAgo(70 - i * 2, 9 + (i % 6));
    const interstate =
      warehouse === "Panipat Hub" || warehouse === "Paradip Hub";
    // Later orders are earlier in lifecycle
    const stage = Math.min(7, Math.floor((25 - i) / 3) + (i % 3 === 0 ? 0 : 2));
    const statuses: DocumentStatus[] = [
      "generated",
      "downloaded",
      "approved",
      "verified",
      "pending",
      "cancelled",
    ];
    seeds.push({
      index: i,
      orderNumber: `ORD-2026-${pad(1000 + i)}`,
      poNumber: `PO-2026-${pad(2200 + i)}`,
      invoiceNumber: `INV-2026-${pad(3400 + i)}`,
      proformaNumber: `PI-2026-${pad(1100 + i)}`,
      seller,
      warehouse,
      productIdx,
      quantityMt,
      unitPrice,
      poDate,
      interstate,
      stage,
      poStatus: i === 23 ? "cancelled" : statuses[(i - 1) % 5],
      invStatus: i === 24 ? "pending" : statuses[i % 5],
    });
  }
  return seeds;
}

const SEEDS = buildSeeds();

function buildPurchaseOrders(): PurchaseOrderDocument[] {
  return SEEDS.map((s) => {
    const product = DOCUMENT_PRODUCTS[s.productIdx];
    const pricing = buildPricing(s.quantityMt, s.unitPrice, s.interstate);
    const line = buildLineItem(
      `li-po-${s.index}`,
      s.productIdx,
      s.quantityMt,
      s.unitPrice,
    );
    return {
      id: `po-${s.index}`,
      poNumber: s.poNumber,
      orderNumber: s.orderNumber,
      product: product.name,
      grade: product.grade,
      seller: s.seller,
      warehouse: s.warehouse,
      quantityMt: s.quantityMt,
      poDate: s.poDate,
      amount: pricing.grandTotal,
      status: s.poStatus,
      buyer: { ...BUYER_COMPANY },
      sellerInfo: sellerParty(s.seller),
      lineItems: [line],
      pricing,
      paymentTerms:
        s.index % 3 === 0
          ? "100% Advance before dispatch"
          : s.index % 3 === 1
            ? "Credit 15 Days from invoice date"
            : "On Loading — NEFT/RTGS within 24 hrs",
      deliveryTerms: `Ex-Works ${s.warehouse} · Buyer arranged freight · Delivery window 5–7 working days`,
      approval: {
        approvedBy:
          s.poStatus === "cancelled" ? "—" : "Anita Sharma · Procurement Head",
        approvedAt: s.poStatus === "cancelled" ? "" : addDaysIso(s.poDate, 1),
        remarks:
          s.poStatus === "cancelled"
            ? "PO cancelled due to commercial revision"
            : "Approved against active rate contract",
      },
      timeline: lifecycleTimeline(s.poDate, Math.min(s.stage, 7)),
      downloadedAt:
        s.poStatus === "downloaded" ? addDaysIso(s.poDate, 2) : null,
    };
  });
}

function buildInvoices(): InvoiceDocument[] {
  // All 25 orders have invoices once PO exists (stage >= 1), keep 25 invoices
  return SEEDS.map((s) => {
    const product = DOCUMENT_PRODUCTS[s.productIdx];
    const pricing = buildPricing(s.quantityMt, s.unitPrice, s.interstate);
    const invoiceDate = addDaysIso(s.poDate, 3);
    const paid = s.stage >= 2;
    const paymentStatus = paid
      ? "paid"
      : s.index % 7 === 0
        ? "overdue"
        : s.index % 5 === 0
          ? "partial"
          : "unpaid";
    const invoiceStatus =
      s.poStatus === "cancelled"
        ? "cancelled"
        : paid
          ? "paid"
          : s.invStatus === "pending"
            ? "draft"
            : "generated";

    return {
      id: `inv-${s.index}`,
      invoiceNumber: s.invoiceNumber,
      orderNumber: s.orderNumber,
      poNumber: s.poNumber,
      invoiceDate,
      amount: pricing.taxableValue,
      gst: pricing.cgst + pricing.sgst + pricing.igst,
      totalAmount: pricing.grandTotal,
      paymentStatus,
      invoiceStatus,
      status: s.invStatus,
      product: product.name,
      grade: product.grade,
      seller: s.seller,
      warehouse: s.warehouse,
      company: { ...PLATFORM_COMPANY },
      buyer: { ...BUYER_COMPANY },
      sellerInfo: sellerParty(s.seller),
      lineItems: [
        buildLineItem(
          `li-inv-${s.index}`,
          s.productIdx,
          s.quantityMt,
          s.unitPrice,
        ),
      ],
      pricing,
      paymentInfo: {
        method:
          s.index % 3 === 0
            ? "Advance — NEFT"
            : s.index % 3 === 1
              ? "Credit 15 Days"
              : "On Loading — RTGS",
        dueDate: addDaysIso(invoiceDate, s.index % 3 === 1 ? 15 : 2),
        paidDate: paid ? addDaysIso(invoiceDate, 2) : null,
        utr: paid ? `UTR${240000000000 + s.index * 137}` : null,
        transactionId: paid ? `TXN-PT-${pad(9000 + s.index)}` : null,
      },
      timeline: lifecycleTimeline(s.poDate, Math.min(s.stage, 7)),
      downloadedAt:
        s.invStatus === "downloaded" ? addDaysIso(invoiceDate, 1) : null,
    };
  });
}

function buildProformas(): ProformaInvoiceDocument[] {
  // First 18 seeds as proformas (requirement: display all — use a solid set)
  return SEEDS.slice(0, 18).map((s) => {
    const product = DOCUMENT_PRODUCTS[s.productIdx];
    const pricing = buildPricing(s.quantityMt, s.unitPrice, s.interstate);
    const createdDate = addDaysIso(s.poDate, -2);
    const expiryDate = addDaysIso(createdDate, 10);
    const expired = new Date(expiryDate) < new Date("2026-08-03");
    let status: ProformaInvoiceDocument["status"] = "active";
    if (s.stage >= 1) status = "converted";
    else if (expired) status = "expired";
    if (s.index === 17) status = "cancelled";

    return {
      id: `pi-${s.index}`,
      proformaNumber: s.proformaNumber,
      product: product.name,
      grade: product.grade,
      orderNumber: s.orderNumber,
      poNumber: s.stage >= 0 ? s.poNumber : null,
      amount: pricing.grandTotal,
      createdDate,
      expiryDate,
      status,
      docStatus:
        status === "converted"
          ? "verified"
          : status === "expired"
            ? "cancelled"
            : "generated",
      seller: s.seller,
      warehouse: s.warehouse,
      buyer: { ...BUYER_COMPANY },
      sellerInfo: sellerParty(s.seller),
      lineItems: [
        buildLineItem(
          `li-pi-${s.index}`,
          s.productIdx,
          s.quantityMt,
          s.unitPrice,
        ),
      ],
      pricing,
      paymentTerms:
        "As per commercial offer · Subject to PetroTrade confirmation",
      validityNote: "Prices valid until expiry. Subject to stock availability.",
      convertedInvoiceId: status === "converted" ? `inv-${s.index}` : null,
    };
  });
}

function buildCertificates(): CertificateDocument[] {
  return [];
}

function buildDownloads(
  pos: PurchaseOrderDocument[],
  invoices: InvoiceDocument[],
): DownloadableDocument[] {
  const files: DownloadableDocument[] = [];
  let n = 1;

  const push = (
    partial: Omit<DownloadableDocument, "id" | "mimeType"> & {
      mimeType?: string;
    },
  ) => {
    files.push({
      id: `dl-${n++}`,
      mimeType: partial.mimeType ?? "application/pdf",
      ...partial,
    });
  };

  // POs
  pos.slice(0, 6).forEach((po, i) => {
    push({
      fileName: `${po.poNumber}.pdf`,
      category: "purchase_order",
      sizeBytes: 240_000 + (i + 1) * 1200,
      date: po.poDate,
      orderNumber: po.orderNumber,
      documentNumber: po.poNumber,
      seller: po.seller,
      warehouse: po.warehouse,
      product: po.product,
      status: po.status === "pending" ? "generated" : po.status,
      relatedId: po.id,
    });
  });

  // Invoices
  invoices.slice(0, 6).forEach((inv, i) => {
    push({
      fileName: `${inv.invoiceNumber}.pdf`,
      category: "invoice",
      sizeBytes: 180_000 + i * 3500,
      date: inv.invoiceDate,
      orderNumber: inv.orderNumber,
      documentNumber: inv.invoiceNumber,
      seller: inv.seller,
      warehouse: inv.warehouse,
      product: inv.product,
      status: inv.status,
      relatedId: inv.id,
    });
  });

  // Certificates removed from Documents module

  // Packing / challan / e-way / transport / receipts / payment proof
  const extras: Array<{
    category: DownloadableDocument["category"];
    prefix: string;
  }> = [
    { category: "packing_list", prefix: "PL" },
    { category: "delivery_challan", prefix: "DC" },
    { category: "e_way_bill", prefix: "EWB" },
    { category: "transport_receipt", prefix: "LR" },
    { category: "receipt", prefix: "RCT" },
    { category: "payment_proof", prefix: "PP" },
  ];

  extras.forEach((ex, ei) => {
    for (let k = 0; k < 2; k++) {
      const seed = SEEDS[ei * 2 + k];
      if (!seed) continue;
      const product = DOCUMENT_PRODUCTS[seed.productIdx];
      const docNo = `${ex.prefix}-2026-${pad(500 + ei * 10 + k)}`;
      push({
        fileName: `${docNo}.pdf`,
        category: ex.category,
        sizeBytes: 95_000 + (ei + k) * 6200,
        date: addDaysIso(seed.poDate, 6 + ei),
        orderNumber: seed.orderNumber,
        documentNumber: docNo,
        seller: seed.seller,
        warehouse: seed.warehouse,
        product: product.name,
        status: k === 0 ? "generated" : "downloaded",
        relatedId: null,
      });
    }
  });

  // Ensure exactly 30
  while (files.length < 30) {
    const seed = SEEDS[files.length % SEEDS.length];
    const product = DOCUMENT_PRODUCTS[seed.productIdx];
    push({
      fileName: `DOC-EXTRA-${pad(files.length + 1)}.pdf`,
      category: "receipt",
      sizeBytes: 110_000 + files.length * 1000,
      date: addDaysIso(seed.poDate, 5),
      orderNumber: seed.orderNumber,
      documentNumber: `DOC-${pad(files.length + 1)}`,
      seller: seed.seller,
      warehouse: seed.warehouse,
      product: product.name,
      status: "generated",
      relatedId: null,
    });
  }

  return files.slice(0, 30);
}

function buildNotifications(): DocumentNotification[] {
  return [
    {
      id: "dn-1",
      type: "po_ready",
      title: "Purchase Order Ready",
      message:
        "PO-2026-2201 is ready for download and sharing with your warehouse team.",
      createdAt: isoDaysAgo(0, 9),
      read: false,
      href: documentsPoPath("po-1"),
      relatedId: "po-1",
    },
    {
      id: "dn-2",
      type: "invoice_generated",
      title: "Invoice Generated",
      message:
        "INV-2026-3403 has been generated for ORD-2026-1003 · PetroTrade Supply Network.",
      createdAt: isoDaysAgo(1, 11),
      read: false,
      href: documentsInvoicePath("inv-3"),
      relatedId: "inv-3",
    },
    {
      id: "dn-5",
      type: "download_completed",
      title: "Download Completed",
      message:
        "Bundle download of packing list and e-way bill completed successfully.",
      createdAt: isoDaysAgo(4, 10),
      read: true,
      href: "/documents",
    },
    {
      id: "dn-6",
      type: "invoice_generated",
      title: "Invoice Generated",
      message:
        "Tax invoice INV-2026-3408 linked to PO-2026-2208 is now available.",
      createdAt: isoDaysAgo(5, 12),
      read: true,
      href: documentsInvoicePath("inv-8"),
      relatedId: "inv-8",
    },
  ];
}

export const purchaseOrdersMock = buildPurchaseOrders();
export const invoicesMock = buildInvoices();
export const proformaInvoicesMock = buildProformas();
export const certificatesMock = buildCertificates();
export const downloadsMock = buildDownloads(
  purchaseOrdersMock,
  invoicesMock,
);
export const documentNotificationsMock = buildNotifications();

export const DEFAULT_DOCUMENTS_FILTERS: DocumentsFiltersState = {
  search: "",
  documentType: "all",
  status: "all",
  warehouse: "all",
  seller: "all",
  dateFrom: "",
  dateTo: "",
  sortBy: "newest",
};

export function buildRecentlyGenerated(
  pos: PurchaseOrderDocument[],
  invoices: InvoiceDocument[],
  certificates: CertificateDocument[],
): RecentlyGeneratedItem[] {
  const items: RecentlyGeneratedItem[] = [
    ...pos.map((p) => ({
      id: p.id,
      title: "Purchase Order",
      documentNumber: p.poNumber,
      type: "purchase_order" as const,
      orderNumber: p.orderNumber,
      seller: p.seller,
      warehouse: p.warehouse,
      createdAt: p.poDate,
      status: p.status,
      href: documentsPoPath(p.id),
    })),
    ...invoices.map((i) => ({
      id: i.id,
      title: "Tax Invoice",
      documentNumber: i.invoiceNumber,
      type: "invoice" as const,
      orderNumber: i.orderNumber,
      seller: i.seller,
      warehouse: i.warehouse,
      createdAt: i.invoiceDate,
      status: i.status,
      href: documentsInvoicePath(i.id),
    })),
    ...certificates.map((c) => ({
      id: c.id,
      title: c.name,
      documentNumber: c.certificateNumber,
      type: "certificate" as const,
      orderNumber: c.orderNumber,
      seller: c.seller,
      warehouse: c.warehouse,
      createdAt: c.issueDate,
      status: c.status,
      href: "/documents/certificates",
    })),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);
}
