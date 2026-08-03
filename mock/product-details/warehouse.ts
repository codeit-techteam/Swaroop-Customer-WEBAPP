import type { LogisticsEstimate } from "@/types/product-details";

export function buildLogisticsEstimate(input: {
  warehouseLabel: string;
  eta: string;
}): LogisticsEstimate {
  return {
    warehouse: input.warehouseLabel,
    warehouseRegion: input.warehouseLabel,
    deliveryLocation: "Mumbai, Maharashtra",
    estimatedDelivery: input.eta.includes("Business")
      ? input.eta
      : input.eta.replace("Days", "Days"),
    transportMode: "Road Freight (FTL)",
    freightLabel: "Freight to Mumbai",
    freightPerMt: 1250,
  };
}
