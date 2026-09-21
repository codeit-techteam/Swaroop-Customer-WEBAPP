import apiClient from "@/lib/apiClient";
import { num, type Envelope } from "@/lib/api-envelope";
import type { CreditSummary, OutstandingPayment } from "@/types/dashboard";

export type BackendCreditLimit = {
  approvedLimit?: string;
  availableLimit?: string;
  outstandingAmount?: string;
  status?: string;
  currency?: string;
};

export type BackendCreditAccount = {
  application?: {
    id: string;
    applicationNumber: string;
    status: string;
    requestedLimit: string;
    requestedTenureDays?: number | null;
    purpose?: string | null;
    createdAt?: string;
  } | null;
  account?: {
    approvedLimit?: string;
    availableLimit?: string;
    outstandingAmount?: string;
    status?: string;
  } | null;
  status?: string;
};

export async function fetchCustomerCreditLimit(): Promise<BackendCreditLimit> {
  const payload = await apiClient.get<Envelope<BackendCreditLimit>>("/customer/credit/limit");
  return payload.data;
}

export async function fetchCustomerCreditSummary(): Promise<BackendCreditAccount> {
  const payload = await apiClient.get<Envelope<BackendCreditAccount>>(
    "/customer/credit/summary",
  );
  return payload.data;
}

export async function applyCustomerCredit(input: {
  requestedLimit: number;
  requestedTenureDays?: number;
  purpose?: string;
}) {
  const payload = await apiClient.post<Envelope<unknown>>("/customer/credit/apply", input);
  return payload.data;
}

export function toDashboardCredit(limit: BackendCreditLimit): {
  creditSummary: CreditSummary;
  outstanding: OutstandingPayment;
} {
  const approved = num(limit.approvedLimit);
  const available = num(limit.availableLimit);
  const outstanding = num(limit.outstandingAmount);
  return {
    creditSummary: {
      availableCredit: available,
      creditLimit: approved,
      currency: "INR",
      availablePercent: approved > 0 ? Math.round((available / approved) * 100) : 0,
    },
    outstanding: {
      amount: outstanding,
      currency: "INR",
      invoiceId: "",
      dueLabel: outstanding > 0 ? "Outstanding PetroTrade credit" : "No invoices due",
    },
  };
}
