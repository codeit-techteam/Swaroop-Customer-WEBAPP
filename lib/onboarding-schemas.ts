import { z } from "zod";

export const companyInfoSchema = z.object({
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
  industrySector: z
    .enum([
      "petrochemicals",
      "polymers",
      "lubricants",
      "industrial_chemicals",
      "trading",
      "manufacturing",
      "others",
    ])
    .optional()
    .or(z.literal("")),
  registrationNumber: z
    .string()
    .max(30, "Registration number is too long")
    .refine((val) => !val || val.length >= 5, {
      message: "Registration number must be at least 5 characters",
    })
    .optional()
    .or(z.literal("")),
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
  fullAddress: z.string().min(5, "Address is required"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

export const creditEligibilitySchema = z.object({
  bankStatements: z.string().min(1, "Bank statements are required"),
  itr: z.string().min(1, "ITR documents are required"),
  creditLimit: z
    .string()
    .min(1, "Target facility amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
});

export type CreditEligibilityFormValues = z.infer<
  typeof creditEligibilitySchema
>;
