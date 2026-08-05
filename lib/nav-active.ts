import type { NavItem } from "@/types";

/** Exact match or nested detail route under this href. */
export function isHrefMatchingPath(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/**
 * Among siblings, pick the most specific (longest) href that matches the path.
 * Prevents `/marketplace` (Browse) from staying active on `/marketplace/offers`.
 */
export function getBestMatchingHref(
  pathname: string,
  items: NavItem[] | undefined,
): string | null {
  if (!items?.length) return null;

  let best: string | null = null;
  for (const item of items) {
    if (!item.href || !isHrefMatchingPath(pathname, item.href)) continue;
    if (!best || item.href.length > best.length) {
      best = item.href;
    }
  }
  return best;
}

export function isNavItemActive(
  pathname: string,
  item: NavItem,
  siblings?: NavItem[],
): boolean {
  if (!item.href) return false;
  if (!isHrefMatchingPath(pathname, item.href)) return false;
  if (!siblings?.length) return true;
  const best = getBestMatchingHref(pathname, siblings);
  return best === item.href;
}

export function isNavBranchActive(pathname: string, item: NavItem): boolean {
  if (
    item.href &&
    isHrefMatchingPath(pathname, item.href) &&
    !item.children?.length
  ) {
    return true;
  }
  if (item.children?.length) {
    return item.children.some((child) => isNavBranchActive(pathname, child));
  }
  if (item.href && pathname === item.href) return true;
  return false;
}

/** Top-level nav id whose branch matches the current path (if any). */
export function findActiveTopNavId(
  pathname: string,
  nav: NavItem[],
): string | null {
  for (const item of nav) {
    if (item.action) continue;
    if (isNavBranchActive(pathname, item)) return item.id;
    // Parent section root (e.g. /documents) with children
    if (
      item.href &&
      item.children?.length &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`))
    ) {
      return item.id;
    }
  }
  return null;
}
