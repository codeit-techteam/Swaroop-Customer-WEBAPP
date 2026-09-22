/**
 * Customer Profile module — enterprise company profile for the Customer Portal.
 * Frontend-only types covering KYC, credit, security, and preferences.
 */

export type ProfileTabId =
  | "company"
  | "contacts"
  | "business_address"
  | "shipping"
  | "bank"
  | "gst_pan"
  | "credit"
  | "security"
  | "preferences"
  | "activity";

export type VerificationStatus =
  "verified" | "pending" | "rejected" | "not_started";

export type CreditStatus =
  "eligible" | "active" | "suspended" | "not_eligible" | "under_review";

export type ContactRole =
  "primary" | "accounts" | "purchase_manager" | "warehouse_manager" | "other";

export type ContactStatus = "active" | "inactive";

export type MembershipTier = "standard" | "silver" | "gold" | "platinum";

export type ProfileDocumentKind =
  | "gst_certificate"
  | "pan_card"
  | "company_registration"
  | "cancelled_cheque"
  | "purchase_order"
  | "invoice"
  | "quality_certificate"
  | "transport_document";

export interface CompanyProfile {
  legalName: string;
  tradeName: string;
  businessType: string;
  industry: string;
  gstNumber: string;
  pan: string;
  cin: string;
  dateOfIncorporation: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  logoInitials: string;
  customerId: string;
  customerCode: string;
  registeredState: string;
  customerSince: string;
  membership: MembershipTier;
  gstVerified: boolean;
  panVerified: boolean;
  creditEligible: boolean;
}

export interface ProfileContact {
  id: string;
  name: string;
  designation: string;
  role: ContactRole;
  phone: string;
  email: string;
  status: ContactStatus;
  isPrimary: boolean;
}

export interface BusinessAddressProfile {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mapLabel: string;
  lat: number;
  lng: number;
}

export interface ShippingAddressProfile {
  id: string;
  warehouseName: string;
  contactPerson: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isPreferred: boolean;
}

export interface BankAccountProfile {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upi: string;
  accountType: "current" | "savings" | "cash_credit";
  isPrimary: boolean;
  isVerified: boolean;
}

export interface GstPanDetails {
  gstNumber: string;
  gstStatus: VerificationStatus;
  gstRegistrationDate: string;
  gstLegalName: string;
  panNumber: string;
  panLinked: boolean;
  panStatus: VerificationStatus;
  gstCertificateFile: string;
  panCardFile: string;
}

export interface CreditHistoryItem {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
}

export interface CreditProfile {
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  paymentScore: number;
  averagePaymentDays: number;
  creditPartner: string;
  interestRate: number;
  paymentTerms: Array<"advance" | "15_days" | "30_days">;
  history: CreditHistoryItem[];
}

export interface LoginSession {
  id: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityProfile {
  passwordLastChanged: string;
  twoFactorEnabled: boolean;
  sessions: LoginSession[];
}

export interface ProfilePreferences {
  language: string;
  currency: string;
  theme: "light" | "system";
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  desktop: boolean;
  orderAlerts: boolean;
  shipmentAlerts: boolean;
  offers: boolean;
  invoiceAlerts: boolean;
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  description: string;
  at: string;
  category: "account" | "kyc" | "order" | "payment" | "shipment" | "document";
}

export interface ProfileDocument {
  id: string;
  kind: ProfileDocumentKind;
  title: string;
  fileName: string;
  uploadedAt: string;
  sizeLabel: string;
  status: "available" | "pending" | "expired";
}

export interface ProfileDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  creditAvailable: number;
  outstandingPayment: number;
  invoices: number;
  certificates: number;
  shipments: number;
}

export interface CustomerProfileState {
  company: CompanyProfile;
  contacts: ProfileContact[];
  businessAddress: BusinessAddressProfile;
  shippingAddresses: ShippingAddressProfile[];
  bankAccounts: BankAccountProfile[];
  gstPan: GstPanDetails;
  credit: CreditProfile;
  security: SecurityProfile;
  preferences: ProfilePreferences;
  activity: ProfileActivityItem[];
  documents: ProfileDocument[];
  stats: ProfileDashboardStats;
  lastLogin: string;
  verificationStatus: VerificationStatus;
  creditStatus: CreditStatus;
}
