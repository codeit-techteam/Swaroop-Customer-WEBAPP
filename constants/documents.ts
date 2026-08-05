import type {
  CertificateKind,
  DocumentNotificationType,
  DocumentStatus,
  DocumentType,
  DownloadCategory,
  InvoiceDocStatus,
  PaymentDocStatus,
  ProformaStatus,
} from "@/types/documents";

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  generated: "Generated",
  downloaded: "Downloaded",
  pending: "Pending",
  approved: "Approved",
  verified: "Verified",
  cancelled: "Cancelled",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  purchase_order: "Purchase Order",
  invoice: "Invoice",
  proforma: "Proforma Invoice",
  gst_invoice: "GST Invoice",
  certificate: "Certificate",
  packing_list: "Packing List",
  delivery_challan: "Delivery Challan",
  e_way_bill: "E-Way Bill",
  transport_receipt: "Transport Receipt",
  receipt: "Receipt",
  payment_proof: "Payment Proof",
};

export const DOWNLOAD_CATEGORY_LABELS: Record<DownloadCategory, string> = {
  purchase_order: "Purchase Order",
  invoice: "Invoices",
  gst_invoice: "GST Invoice",
  certificate: "Certificates",
  packing_list: "Packing List",
  delivery_challan: "Delivery Challan",
  e_way_bill: "E-Way Bill",
  transport_receipt: "Transport Receipt",
  receipt: "Receipts",
  payment_proof: "Payment Proof",
};

export const CERTIFICATE_KIND_LABELS: Record<CertificateKind, string> = {
  material_test: "Material Test Certificate",
  quality: "Quality Certificate",
  inspection: "Inspection Certificate",
  origin: "Certificate of Origin",
  manufacturer: "Manufacturer Certificate",
  lab_test: "Lab Test Report",
};

export const PAYMENT_DOC_STATUS_LABELS: Record<PaymentDocStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  refunded: "Refunded",
};

export const INVOICE_DOC_STATUS_LABELS: Record<InvoiceDocStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const PROFORMA_STATUS_LABELS: Record<ProformaStatus, string> = {
  active: "Active",
  expired: "Expired",
  converted: "Converted",
  cancelled: "Cancelled",
};

export const DOCUMENT_NOTIFICATION_LABELS: Record<
  DocumentNotificationType,
  string
> = {
  po_ready: "Purchase Order Ready",
  invoice_generated: "Invoice Generated",
  gst_ready: "GST Invoice Ready",
  certificate_available: "Certificate Available",
  download_completed: "Download Completed",
};

/** Blind marketplace supply sources — never real supplier company names. */
export const DOCUMENT_SELLERS = [
  "PetroTrade Supply Network",
  "Verified Supply Network",
  "West India Hub",
  "East India Hub",
  "Coastal Hub",
] as const;

export const DOCUMENT_WAREHOUSES = [
  "Jamnagar Hub",
  "Hazira Hub",
  "Dahej Hub",
  "Mundra Hub",
  "Panipat Hub",
  "Paradip Hub",
] as const;

export const DOCUMENT_PRODUCTS = [
  { name: "PP Raffia", grade: "H030SG", hsn: "39021000" },
  { name: "HDPE", grade: "B5500", hsn: "39012000" },
  { name: "LLDPE", grade: "F18020", hsn: "39011010" },
  { name: "PVC Resin", grade: "S-65", hsn: "39041000" },
  { name: "PET Resin", grade: "ASPET-G1", hsn: "39076100" },
] as const;

export const BUYER_COMPANY = {
  name: "Swaroop Polymers Pvt Ltd",
  gstin: "24AABCS1429B1Z8",
  address: "Plot 42, GIDC Industrial Estate, Phase II",
  city: "Vadodara",
  state: "Gujarat",
  pincode: "390010",
  contactPerson: "Rajesh Mehta",
  phone: "+91 98765 43210",
  email: "procurement@swarooppolymers.in",
} as const;

export const PLATFORM_COMPANY = {
  name: "PetroTrade Technologies Pvt Ltd",
  gstin: "27AABCP4821Q1ZV",
  address: "12th Floor, One BKC, Bandra Kurla Complex",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400051",
  contactPerson: "Accounts Desk",
  phone: "+91 22 6987 4500",
  email: "invoices@petrotrade.in",
} as const;

export function documentsPoPath(id: string) {
  return `/documents/purchase-orders/${id}`;
}

export function documentsInvoicePath(id: string) {
  return `/documents/invoices/${id}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
