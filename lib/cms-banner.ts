import { ROUTES } from "@/constants";
import type { CmsBanner } from "@/types/cms-banner";

/** Desktop/web prefers mediaUrl; falls back to mobile creative. */
export function cmsBannerImage(
  banner: CmsBanner,
  options?: { preferMobile?: boolean },
): string {
  if (options?.preferMobile) {
    return banner.mobileMediaUrl || banner.mediaUrl || banner.mediaKey || "";
  }
  return banner.mediaUrl || banner.mobileMediaUrl || banner.mediaKey || "";
}

export function cmsBannerHref(banner: CmsBanner): string | null {
  const action = banner.ctaAction || "NO_ACTION";
  const targetId = banner.targetId?.trim();
  const targetRoute = banner.targetRoute?.trim();
  const externalUrl = banner.externalUrl?.trim();

  if (action === "NO_ACTION" && !targetRoute && !externalUrl) return null;

  if (action === "OPEN_EXTERNAL_URL" && externalUrl) return externalUrl;
  if (action === "OPEN_MARKETPLACE") return ROUTES.marketplace;
  if (action === "OPEN_ORDERS") return ROUTES.orders;
  if (action === "OPEN_PRODUCT" && targetId) {
    return `${ROUTES.marketplaceProduct}/${targetId}`;
  }
  if (action === "OPEN_OFFER" && targetId) {
    return `${ROUTES.marketplaceOfferDetail}/${targetId}`;
  }

  if (targetRoute) {
    if (/^https?:\/\//i.test(targetRoute)) return targetRoute;
    return targetRoute.startsWith("/") ? targetRoute : `/${targetRoute}`;
  }

  if (externalUrl) return externalUrl;
  return null;
}

export function cmsBannerIsExternal(href: string | null): boolean {
  return Boolean(href && /^https?:\/\//i.test(href));
}
