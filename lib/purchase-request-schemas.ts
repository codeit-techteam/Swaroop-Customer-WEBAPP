import { z } from "zod";
import { PACKAGING_OPTIONS } from "@/mock/purchase-request";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const packagingEnum = z.enum([
  PACKAGING_OPTIONS[0],
  ...PACKAGING_OPTIONS.slice(1),
]);

export const purchaseRequestFormSchema = z.object({
  quantityMt: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
  packaging: packagingEnum,
  deliveryLocationId: z.string().min(1, "Select a delivery address"),
  expectedDeliveryDate: z.string().optional().or(z.literal("")),
  remarks: z.string().max(500, "Remarks must be under 500 characters"),
  gstNumber: z
    .string()
    .min(1, "GST number is required")
    .regex(gstinRegex, "Enter a valid GSTIN"),
  purchaseOrderReference: z.string().max(50).optional().or(z.literal("")),
  /** Mirrors deliveryLocationId — kept for downstream PO/order payloads */
  shippingAddressId: z.string().min(1, "Select a delivery address"),
  billingAddressId: z.string().min(1, "Select a billing address"),
  /** When true, billing is treated as same as delivery address */
  sameAsShipping: z.boolean(),
});

export type PurchaseRequestFormSchema = z.infer<
  typeof purchaseRequestFormSchema
>;

export function refineQuantityAgainstMoq(
  quantityMt: number,
  moq: number,
  stock: number,
): string | null {
  if (quantityMt < moq) {
    return `Minimum Order Quantity is ${moq} MT`;
  }
  if (quantityMt > stock) {
    return `Quantity cannot exceed available stock (${stock} MT)`;
  }
  return null;
}
