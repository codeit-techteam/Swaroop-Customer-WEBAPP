import { z } from "zod";

export const companyInfoSchema = z.object({
  legalName: z
    .string()
    .min(2, "Company legal name is required")
    .max(200, "Name is too long"),
  constitutionType: z.enum(
    [
      "private_limited",
      "public_limited",
      "llp",
      "partnership",
      "sole_proprietorship",
      "others",
    ],
    { required_error: "Select constitution type" },
  ),
  industrySector: z.enum(
    [
      "petrochemicals",
      "polymers",
      "lubricants",
      "industrial_chemicals",
      "trading",
      "manufacturing",
      "others",
    ],
    { required_error: "Select industry sector" },
  ),
  registrationNumber: z
    .string()
    .min(5, "Registration number is required")
    .max(30, "Registration number is too long"),
  dateOfIncorporation: z.string().min(1, "Date of incorporation is required"),
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

export const gstInfoSchema = z.object({
  gstin: z
    .string()
    .min(15, "GSTIN must be 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
      "Enter a valid GSTIN",
    ),
  certificateFileName: z.string().min(1, "Upload GST registration certificate"),
  isVerified: z.literal(true, {
    errorMap: () => ({ message: "Please verify your GSTIN" }),
  }),
});

export type GstInfoFormValues = z.infer<typeof gstInfoSchema>;

export const businessAddressSchema = z.object({
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z.string(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  useAsShipping: z.boolean(),
});

export type BusinessAddressFormValues = z.infer<typeof businessAddressSchema>;

export const shippingAddressSchema = z.object({
  terminalName: z.string().min(2, "Terminal name is required"),
  fullAddress: z.string().min(5, "Full address is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  mobileNumber: z
    .string()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid mobile number"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

export const creditEligibilitySchema = z.object({
  auditedFinancials: z.string().min(1, "Audited financials are required"),
  bankStatements: z.string().min(1, "Bank statements are required"),
  itr: z.string().min(1, "ITR documents are required"),
  creditLimit: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d{1,2})?$/.test(val),
      "Enter a valid amount",
    ),
});

export type CreditEligibilityFormValues = z.infer<
  typeof creditEligibilitySchema
>;
