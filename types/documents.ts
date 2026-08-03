/**
 * Documents module — purchase orders, invoices, certificates, downloads.
 * Frontend-only types linked to the order lifecycle.
 */

export type DocumentStatus =
  | "generated"
  | "downloaded"
  | "pending"
  | "approved"
  | "verified"
  | "cancelled";

export type DocumentType =
  | "purchase_order"
  | "invoice"
  | "proforma"
  | "gst_invoice"
  | "certificate"
  | "packing_list"
  | "delivery_challan"
  | "e_way_bill"
  | "transport_receipt"
  | "receipt"
  | "payment_proof";

export type CertificateKind =
  | "material_test"
  | "quality"
  | "inspection"
  | "origin"
  | "manufacturer"
  | "lab_test";

export type PaymentDocStatus =
  "unpaid" | "partial" | "paid" | "overdue" | "refunded";

export type InvoiceDocStatus =
  "draft" | "generated" | "sent" | "paid" | "cancelled";

export type ProformaStatus = "active" | "expired" | "converted" | "cancelled";

export type DocumentSortBy = "newest" | "oldest";

/** Legacy filter key kept for store re-exports */
export type DocumentCategoryFilter =
  | "all"
  | "invoice"
  | "delivery_challan"
  | "e_way_bill"
  | "certificate"
  | "other"
  | DocumentType;

export interface PartyInfo {
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface DocumentLineItem {
  id: string;
  product: string;
  grade: string;
  hsn: string;
  quantityMt: number;
  unitPrice: number;
  taxableValue: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface DocumentPricing {
  unitPrice: number;
  quantityMt: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  freight: number;
  insurance: number;
  grandTotal: number;
}

export interface DocumentTimelineEvent {
  id: string;
  label: string;
  description?: string;
  at: string;
  status: "completed" | "current" | "upcoming";
}

export interface DocumentApproval {
  approvedBy: string;
  approvedAt: string;
  remarks: string;
}

export interface PurchaseOrderDocument {
  id: string;
  poNumber: string;
  orderNumber: string;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  quantityMt: number;
  poDate: string;
  amount: number;
  status: DocumentStatus;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  lineItems: DocumentLineItem[];
  pricing: DocumentPricing;
  paymentTerms: string;
  deliveryTerms: string;
  approval: DocumentApproval;
  timeline: DocumentTimelineEvent[];
  downloadedAt?: string | null;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  invoiceDate: string;
  amount: number;
  gst: number;
  totalAmount: number;
  paymentStatus: PaymentDocStatus;
  invoiceStatus: InvoiceDocStatus;
  status: DocumentStatus;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  company: PartyInfo;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  lineItems: DocumentLineItem[];
  pricing: DocumentPricing;
  paymentInfo: {
    method: string;
    dueDate: string;
    paidDate?: string | null;
    utr?: string | null;
    transactionId?: string | null;
  };
  timeline: DocumentTimelineEvent[];
  downloadedAt?: string | null;
}

export interface ProformaInvoiceDocument {
  id: string;
  proformaNumber: string;
  product: string;
  grade: string;
  orderNumber: string;
  poNumber?: string | null;
  amount: number;
  createdDate: string;
  expiryDate: string;
  status: ProformaStatus;
  docStatus: DocumentStatus;
  seller: string;
  warehouse: string;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  lineItems: DocumentLineItem[];
  pricing: DocumentPricing;
  paymentTerms: string;
  validityNote: string;
  convertedInvoiceId?: string | null;
}

export interface GstInvoiceDocument {
  id: string;
  gstNumber: string;
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
  invoiceDate: string;
  seller: string;
  warehouse: string;
  product: string;
  status: DocumentStatus;
  placeOfSupply: string;
  hsn: string;
  buyerGstin: string;
  sellerGstin: string;
}

export interface CertificateDocument {
  id: string;
  name: string;
  certificateNumber: string;
  kind: CertificateKind;
  product: string;
  grade: string;
  orderNumber: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  seller: string;
  warehouse: string;
  remarks?: string;
}

export type DownloadCategory =
  | "purchase_order"
  | "invoice"
  | "gst_invoice"
  | "certificate"
  | "packing_list"
  | "delivery_challan"
  | "e_way_bill"
  | "transport_receipt"
  | "receipt"
  | "payment_proof";

export interface DownloadableDocument {
  id: string;
  fileName: string;
  category: DownloadCategory;
  sizeBytes: number;
  date: string;
  orderNumber: string;
  documentNumber: string;
  seller: string;
  warehouse: string;
  product: string;
  status: DocumentStatus;
  relatedId?: string | null;
  mimeType: string;
}

export type DocumentNotificationType =
  | "po_ready"
  | "invoice_generated"
  | "gst_ready"
  | "certificate_available"
  | "download_completed";

export interface DocumentNotification {
  id: string;
  type: DocumentNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href?: string;
  relatedId?: string;
}

export interface DocumentsDashboardSummary {
  totalDocuments: number;
  purchaseOrders: number;
  invoices: number;
  certificates: number;
  downloads: number;
}

export interface DocumentsFiltersState {
  search: string;
  documentType: DocumentType | "all";
  status: DocumentStatus | "all";
  warehouse: string;
  seller: string;
  dateFrom: string;
  dateTo: string;
  sortBy: DocumentSortBy;
}

export interface DocumentPreviewState {
  open: boolean;
  title: string;
  subtitle?: string;
  fileName: string;
  categoryLabel: string;
  orderNumber?: string;
  documentNumber?: string;
  content: string;
  relatedId?: string;
}

export interface RecentlyGeneratedItem {
  id: string;
  title: string;
  documentNumber: string;
  type: DocumentType;
  orderNumber: string;
  seller: string;
  warehouse: string;
  createdAt: string;
  status: DocumentStatus;
  href: string;
}
