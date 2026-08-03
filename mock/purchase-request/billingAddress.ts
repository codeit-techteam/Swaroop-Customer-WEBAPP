import type { BillingAddress } from "@/types/purchase-request";

export const DEFAULT_BILLING_ADDRESS_ID = "billing-petrochem";

/**
 * Billing addresses for purchase request — desktop PR enrichment
 * (mobile checkout uses shipping hubs only).
 */
export const billingAddressesMock: BillingAddress[] = [
  {
    id: "billing-petrochem",
    label: "Registered Office",
    companyName: "PetroChem Solutions Ltd.",
    line1: "12th Floor, Trade Centre",
    line2: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    gstin: "27AABCP1234D1Z5",
  },
  {
    id: "billing-plant",
    label: "Plant Billing",
    companyName: "PetroChem Solutions Ltd.",
    line1: "Survey No. 88, MIDC Industrial Area",
    line2: "Pimpri",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411018",
    gstin: "27AABCP1234D1Z5",
  },
];

export const getBillingAddressById = (id: string): BillingAddress =>
  billingAddressesMock.find((entry) => entry.id === id) ??
  billingAddressesMock[0];
