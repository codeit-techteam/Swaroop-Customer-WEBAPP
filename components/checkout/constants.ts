export const CHECKOUT_PAYMENT_PROTOCOL = {
  title: "Payment Protocol",
  bodyPrefix:
    "A Proforma Invoice (PI) will be instantly generated upon order placement. Payment must be completed via",
  bodyMiddle: "within",
  bodySuffix: "to lock the quoted market price.",
  highlights: ["RTGS", "NEFT", "24 Hours"] as const,
};

export const CHECKOUT_INDUSTRIAL_BANNER = {
  imageUrl:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
  features: [
    "Trusted Industrial Procurement",
    "Verified Supply Network",
    "Blind Marketplace",
    "Fast Logistics",
    "Secure Transactions",
  ] as const,
};

export function formatCheckoutPackaging(
  packaging: string,
  quantityMt: number,
): string {
  if (quantityMt >= 10 && /bag/i.test(packaging)) {
    return "Bulk Container";
  }
  return packaging || "Bulk";
}

export const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
