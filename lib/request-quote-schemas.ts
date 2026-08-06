import { z } from "zod";
import { emailSchema, phoneSchema, requiredString } from "@/utils/validators";

export const requestQuoteSchema = z.object({
  contactName: requiredString("Contact name is required"),
  companyName: requiredString("Company name is required"),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .pipe(phoneSchema),
  quantityMt: z.coerce
    .number({ invalid_type_error: "Enter a valid quantity" })
    .min(500, "Minimum order quantity is 500 MT"),
  deliveryLocation: requiredString("Delivery location is required"),
  message: z.string().trim().optional(),
});

export type RequestQuoteFormValues = z.infer<typeof requestQuoteSchema>;
