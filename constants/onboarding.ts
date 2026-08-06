import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Truck,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import type { OnboardingStepId } from "@/types/onboarding";

export const ONBOARDING_STORAGE_KEY = "pt-customer-onboarding";

export const ONBOARDING_ROUTES = {
  root: "/customer/onboarding",
  companyInformation: "/customer/onboarding/company-information",
  gstVerification: "/customer/onboarding/gst-verification",
  businessAddress: "/customer/onboarding/business-address",
  shippingAddress: "/customer/onboarding/shipping-address",
  creditEligibility: "/customer/onboarding/credit-eligibility",
  completion: "/customer/onboarding/completion",
} as const;

export interface OnboardingStepConfig {
  id: OnboardingStepId;
  stepNumber: number;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: "company-information",
    stepNumber: 1,
    label: "Company Info",
    href: ONBOARDING_ROUTES.companyInformation,
    icon: Building2,
  },
  {
    id: "gst-verification",
    stepNumber: 2,
    label: "GST Verification",
    href: ONBOARDING_ROUTES.gstVerification,
    icon: ShieldCheck,
  },
  {
    id: "business-address",
    stepNumber: 3,
    label: "Business Address",
    href: ONBOARDING_ROUTES.businessAddress,
    icon: MapPin,
  },
  {
    id: "shipping-address",
    stepNumber: 4,
    label: "Shipping Address",
    href: ONBOARDING_ROUTES.shippingAddress,
    icon: Truck,
  },
  {
    id: "credit-eligibility",
    stepNumber: 5,
    label: "Credit Eligibility",
    href: ONBOARDING_ROUTES.creditEligibility,
    icon: Landmark,
  },
  {
    id: "completion",
    stepNumber: 6,
    label: "Completion",
    href: ONBOARDING_ROUTES.completion,
    icon: CheckCircle2,
  },
];

export const CONSTITUTION_OPTIONS = [
  { value: "private_limited", label: "Private Limited Company" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "others", label: "Others" },
] as const;

export const INDUSTRY_SECTOR_OPTIONS = [
  { value: "petrochemicals", label: "Petrochemicals" },
  { value: "polymers", label: "Polymers & Plastics" },
  { value: "lubricants", label: "Lubricants & Oils" },
  { value: "industrial_chemicals", label: "Industrial Chemicals" },
  { value: "trading", label: "Trading & Distribution" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "others", label: "Others" },
] as const;

export const COUNTRY_OPTIONS = [{ value: "India", label: "India" }] as const;

/** Onboarding help desk contact — shown in the Need Help dialog */
export const ONBOARDING_SUPPORT_CONTACT = {
  phone: "+91 22 6987 4500",
  phoneHref: "tel:+912269874500",
  email: "support@petrotrade.com",
  emailHref: "mailto:support@petrotrade.com",
  address:
    "12th Floor, One BKC, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  hours: "Mon–Fri · 9:30 AM – 6:30 PM IST",
} as const;

/** Indian states and union territories */
export const INDIAN_STATE_OPTIONS = [
  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
  },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "Delhi", label: "Delhi" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Puducherry", label: "Puducherry" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
] as const;

/** Mock pincode → city/state lookup */
export const PINCODE_LOOKUP: Record<string, { city: string; state: string }> = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400703": { city: "Navi Mumbai", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "393002": { city: "Ankleshwar", state: "Gujarat" },
  "411001": { city: "Pune", state: "Maharashtra" },
};

export function getStepById(id: OnboardingStepId): OnboardingStepConfig {
  const step = ONBOARDING_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown onboarding step: ${id}`);
  return step;
}

export function getStepIndex(id: OnboardingStepId): number {
  return ONBOARDING_STEPS.findIndex((s) => s.id === id);
}

export function getPreviousStep(
  id: OnboardingStepId,
): OnboardingStepConfig | null {
  const index = getStepIndex(id);
  if (index <= 0) return null;
  return ONBOARDING_STEPS[index - 1] ?? null;
}

export function getNextStep(id: OnboardingStepId): OnboardingStepConfig | null {
  const index = getStepIndex(id);
  if (index < 0 || index >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[index + 1] ?? null;
}
