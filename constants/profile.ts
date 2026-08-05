import type { ProfileDocumentKind } from "@/types/profile";

export const PROFILE_DOCUMENT_LABELS: Record<ProfileDocumentKind, string> = {
  gst_certificate: "GST Certificate",
  pan_card: "PAN Card",
  company_registration: "Company Registration",
  cancelled_cheque: "Cancelled Cheque",
  purchase_order: "Purchase Orders",
  invoice: "Invoices",
  gst_invoice: "GST Invoices",
  quality_certificate: "Quality Certificates",
  transport_document: "Transport Documents",
};

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  primary: "Primary Contact",
  accounts: "Accounts Contact",
  purchase_manager: "Purchase Manager",
  warehouse_manager: "Warehouse Manager",
  other: "Other",
};

export const MEMBERSHIP_LABELS: Record<string, string> = {
  standard: "Standard",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};
