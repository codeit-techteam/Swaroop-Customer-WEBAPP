import type { LogisticsEstimate } from "@/types/product-details";

export function buildLogisticsEstimate(input: {
  warehouseLabel: string;
  eta: string;
}): LogisticsEstimate {
  const estimatedDelivery = input.eta?.trim() || null;

  return {
    warehouse: input.warehouseLabel,
    warehouseRegion: input.warehouseLabel,
    deliveryLocation: "",
    estimatedDelivery,
    dispatchWindow: null,
    transportMode: "Road Freight (FTL)",
    freightLabel: "Freight estimate at quote",
    freightPerMt: 1250,
  };
}
