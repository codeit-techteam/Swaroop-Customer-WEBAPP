import type { LogisticsEstimate } from "@/types/product-details";

export function buildLogisticsEstimate(input: {
  warehouseLabel: string;
  eta: string;
}): LogisticsEstimate {
  const estimatedDelivery =
    input.eta?.trim() ||
    (input.warehouseLabel
      ? `${input.warehouseLabel} · 4–6 Business Days`
      : "4–6 Business Days");

  return {
    warehouse: input.warehouseLabel,
    warehouseRegion: input.warehouseLabel,
    deliveryLocation: "Buyer destination",
    estimatedDelivery,
    transportMode: "Road Freight (FTL)",
    freightLabel: "Freight estimate at quote",
    freightPerMt: 1250,
  };
}
