import type { CreditSummary, OutstandingPayment } from "@/types/dashboard";

/**
 * Credit facility summary — mirrors Customer App credit_15 / credit_30 limits
 * with design-aligned available balance for dashboard widgets.
 */
export const creditSummaryMock: CreditSummary = {
  availableCredit: 425000,
  creditLimit: 500000,
  currency: "INR",
  availablePercent: 85,
};

export const outstandingPaymentMock: OutstandingPayment = {
  amount: 12450,
  currency: "INR",
  invoiceId: "PT-INV-402",
  dueLabel: "Overdue",
};
