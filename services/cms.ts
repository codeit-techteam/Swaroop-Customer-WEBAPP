import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import type { CmsBanner, CmsBannerEvent, CmsBannerPlacement } from "@/types/cms-banner";

export async function fetchCustomerBanners(
  placement: CmsBannerPlacement,
  platform = "CUSTOMER_WEB",
): Promise<CmsBanner[]> {
  const payload = await apiClient.get<Envelope<CmsBanner[]>>(
    `/customer/cms/banners?placement=${placement}&platform=${platform}&limit=20`,
  );
  return payload.data ?? [];
}

export function trackCmsBannerEvent(id: string, event: CmsBannerEvent): void {
  void apiClient
    .post(`/customer/cms/banners/${id}/events`, { event })
    .catch(() => undefined);
}
