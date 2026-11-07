import { z } from "zod";
import { emailSchema, phoneSchema, requiredString } from "@/utils/validators";

function isValidIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return phoneSchema.safeParse(digits).success;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return phoneSchema.safeParse(digits.slice(2)).success;
  }
  return false;
}

export const phoneLoginIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .refine(isValidIndianMobile, {
    message: "Enter a valid 10-digit mobile number",
  });

/** OTP-only customer login — mobile number required. */
export const otpLoginSchema = z.object({
  phone: phoneLoginIdentifierSchema,
  rememberMe: z.boolean(),
});

export type OtpLoginFormValues = z.infer<typeof otpLoginSchema>;

/** OTP-only registration — password is never collected. */
export const registerSchema = z.object({
  businessName: requiredString("Business name is required"),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .pipe(phoneSchema),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to continue",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit verification code")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

/** Kept for legacy password-reset UI components that redirect away. */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const passwordRules = {
  minLength: (value: string) => value.length >= 8,
  hasUppercase: (value: string) => /[A-Z]/.test(value),
  hasLowercase: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecial: (value: string) => /[^A-Za-z0-9]/.test(value),
} as const;

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(passwordRules.hasUppercase, {
    message: "Include at least one uppercase letter",
  })
  .refine(passwordRules.hasLowercase, {
    message: "Include at least one lowercase letter",
  })
  .refine(passwordRules.hasNumber, {
    message: "Include at least one number",
  })
  .refine(passwordRules.hasSpecial, {
    message: "Include at least one special character",
  });

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: requiredString("Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
