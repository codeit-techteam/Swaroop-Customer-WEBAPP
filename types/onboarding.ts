export type OnboardingStepId =
  | "company-information"
  | "gst-verification"
  | "business-address"
  | "shipping-address"
  | "credit-eligibility"
  | "completion";

export type ConstitutionType =
  | "private_limited"
  | "public_limited"
  | "llp"
  | "partnership"
  | "sole_proprietorship"
  | "others";

export type IndustrySector =
  | "petrochemicals"
  | "polymers"
  | "lubricants"
  | "industrial_chemicals"
  | "trading"
  | "manufacturing"
  | "others";

export interface CompanyInfo {
  legalName: string;
  constitutionType: ConstitutionType | "";
  industrySector: IndustrySector | "";
  registrationNumber: string;
  dateOfIncorporation: string;
}

export interface GstVerificationResult {
  companyName: string;
  entityStatus: string;
  registeredOn: string;
  pan: string;
}

export interface GstInfo {
  gstin: string;
  isVerified: boolean;
  certificateFileName: string | null;
  verification: GstVerificationResult | null;
}

export interface BusinessAddress {
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  useAsShipping: boolean;
}

export interface ShippingAddress {
  id: string;
  fullAddress: string;
}

export interface UploadedDocument {
  fileName: string;
  uploadedAt: string;
}

export interface CreditDocuments {
  bankStatements: UploadedDocument | null;
  itr: UploadedDocument | null;
}

export interface OnboardingState {
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  companyInfo: CompanyInfo;
  gstInfo: GstInfo;
  businessAddress: BusinessAddress;
  shippingAddresses: ShippingAddress[];
  creditDocuments: CreditDocuments;
  creditLimit: string;
  isCompleted: boolean;
  /** True only after a new registration starts the wizard */
  hasStartedOnboarding: boolean;
  draftSavedAt: string | null;
}
