import apiClient from "@/lib/apiClient";
import { paginateAll, type Envelope } from "@/lib/api-envelope";

export type PriceAlertUnit = "MT" | "KG";
export type PriceAlertDirection = "BELOW" | "ABOVE";

export type PriceAlertEvaluation = {
  supported: boolean;
  reason?: string;
};

export type PriceAlert = {
  id: string;
  gradeId: string;
  productId: string | null;
  targetPrice: string;
  currency: string;
  unit: PriceAlertUnit | string;
  direction: PriceAlertDirection | string;
  enabled: boolean;
  lastTriggeredAt: string | null;
  lastTriggeredPrice: string | null;
  evaluation: PriceAlertEvaluation;
  grade?: { id: string; code: string; name: string };
  product?: { id: string; code: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePriceAlertInput = {
  gradeId: string;
  productId?: string;
  targetPrice: string;
  currency?: string;
  unit?: PriceAlertUnit;
  direction?: PriceAlertDirection;
  enabled?: boolean;
};

export type UpdatePriceAlertInput = {
  targetPrice?: string;
  currency?: string;
  unit?: PriceAlertUnit;
  direction?: PriceAlertDirection;
  enabled?: boolean;
  note?: string;
};

export async function listPriceAlerts(params?: {
  gradeId?: string;
  enabled?: boolean;
}): Promise<PriceAlert[]> {
  return paginateAll(async (page) => {
    const qs = new URLSearchParams({ page: String(page), limit: "50" });
    if (params?.gradeId) qs.set("gradeId", params.gradeId);
    if (params?.enabled !== undefined) {
      qs.set("enabled", params.enabled ? "true" : "false");
    }
    const payload = await apiClient.get<Envelope<PriceAlert[]>>(
      `/customer/price-alerts?${qs.toString()}`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
}

export async function createPriceAlert(
  input: CreatePriceAlertInput,
): Promise<PriceAlert> {
  const payload = await apiClient.post<Envelope<PriceAlert>>(
    "/customer/price-alerts",
    input,
  );
  if (!payload.data) throw new Error("Unable to create price alert");
  return payload.data;
}

export async function updatePriceAlert(
  id: string,
  input: UpdatePriceAlertInput,
): Promise<PriceAlert> {
  const payload = await apiClient.patch<Envelope<PriceAlert>>(
    `/customer/price-alerts/${encodeURIComponent(id)}`,
    input,
  );
  if (!payload.data) throw new Error("Unable to update price alert");
  return payload.data;
}

export async function deletePriceAlert(id: string): Promise<void> {
  await apiClient.delete(`/customer/price-alerts/${encodeURIComponent(id)}`);
}
