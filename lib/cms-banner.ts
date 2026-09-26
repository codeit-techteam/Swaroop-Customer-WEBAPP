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

function resolveCtaHref(options: {
  action?: string | null;
  targetId?: string | null;
  targetRoute?: string | null;
  externalUrl?: string | null;
}): string | null {
  const action = options.action || "NO_ACTION";
  const targetId = options.targetId?.trim();
  const targetRoute = options.targetRoute?.trim();
  const externalUrl = options.externalUrl?.trim();

  if (action === "NO_ACTION" && !targetRoute && !externalUrl) return null;

  if (action === "OPEN_EXTERNAL_URL" && externalUrl) return externalUrl;
  if (action === "OPEN_MARKETPLACE") return ROUTES.marketplace;
  if (action === "OPEN_PURCHASE_REQUEST") return ROUTES.purchaseRequestsCreate;
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

export function cmsBannerHref(banner: CmsBanner): string | null {
  return resolveCtaHref({
    action: banner.ctaAction,
    targetId: banner.targetId,
    targetRoute: banner.targetRoute,
    externalUrl: banner.externalUrl,
  });
}

export function cmsBannerSecondaryHref(banner: CmsBanner): string | null {
  if (!banner.secondaryCtaText && !banner.secondaryCtaAction) return null;
  return resolveCtaHref({
    action: banner.secondaryCtaAction,
    targetId: banner.secondaryTargetId,
    externalUrl: banner.secondaryExternalUrl,
  });
}

export function cmsBannerIsExternal(href: string | null): boolean {
  return Boolean(href && /^https?:\/\//i.test(href));
}

export function cmsBannerIsNavyGrid(banner: CmsBanner): boolean {
  if (banner.layoutVariant === "NAVY_GRID") return true;
  if (banner.layoutVariant === "IMAGE_OVERLAY") return false;
  return !cmsBannerImage(banner);
}
