import type { PaymentMethodId } from "@/types/purchase-request";

export const PAYMENT_PROCESS_COPY: Record<
  PaymentMethodId,
  {
    title: string;
    subtitle: string;
    highlights: string[];
    primaryAction: string;
    statusLabel: string;
  }
> = {
  advance: {
    title: "Advance Payment",
    subtitle: "100% advance — instant processing with lowest pricing.",
    highlights: [
      "100% Advance",
      "Instant Processing",
      "Lowest Pricing",
      "Priority Allocation",
    ],
    primaryAction: "Confirm Advance Receipt",
    statusLabel: "Advance Receipt",
  },
  on_loading: {
    title: "On Loading Payment",
    subtitle:
      "Payment before truck loading — warehouse release after confirmation.",
    highlights: [
      "Payment before truck loading",
      "Loading confirmation required",
      "Warehouse release process",
      "No interest charges",
    ],
    primaryAction: "Confirm Loading Payment",
    statusLabel: "Loading Confirmation",
  },
  on_delivery: {
    title: "On Delivery Payment",
    subtitle: "Payment after delivery — POD required before settlement.",
    highlights: [
      "Payment after delivery",
      "Delivery confirmation",
      "POD required",
      "No interest charges",
    ],
    primaryAction: "Continue to Dispatch",
    statusLabel: "Delivery Pending",
  },
  credit_15: {
    title: "Credit 15 Days",
    subtitle: "Outstanding on approved credit — due 15 days after delivery.",
    highlights: [
      "Credit Limit ₹50,00,000",
      "Available Balance tracked",
      "Due Date Net 15",
      "Interest 1.5%",
    ],
    primaryAction: "Continue with Credit",
    statusLabel: "Outstanding",
  },
  credit_30: {
    title: "Credit 30 Days",
    subtitle: "Extended credit — due 30 days after delivery with late charges.",
    highlights: [
      "Credit Limit ₹50,00,000",
      "Extended Due Date Net 30",
      "Interest 2.5%",
      "Late charges apply after due date",
    ],
    primaryAction: "Continue with Credit",
    statusLabel: "Outstanding",
  },
};

export const TRANSFER_BANK = {
  bankName: "HDFC Bank",
  accountName: "PetroTrade India Pvt. Ltd.",
  accountNumber: "XXXXXX4821",
  ifsc: "HDFC0001234",
  branch: "Bandra Kurla Complex, Mumbai",
} as const;

export const paymentsMock: never[] = [];
