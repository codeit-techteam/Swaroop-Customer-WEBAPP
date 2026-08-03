import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number");

export const panSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Please enter a valid PAN");

export const gstinSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Please enter a valid GSTIN",
  );

export const requiredString = (message = "This field is required") =>
  z.string().trim().min(1, message);

export const optionalString = z.string().trim().optional();

export const positiveNumber = z.coerce
  .number()
  .positive("Must be greater than 0");
