import { getAccessToken, isAccessTokenExpired } from "@/lib/auth-session";

/**
 * Guests use public marketplace reads; authenticated customers keep the
 * customer-scoped paths (same blind payloads + future personalization hooks).
 *
 * Expired / unusable JWTs must NOT route to /customer/* — that previously
 * caused Axios "Network Error" on guest marketplace browse when a stale
 * token still sat in localStorage.
 */
function hasLiveCustomerSession(): boolean {
  const token = getAccessToken();
  return Boolean(token && !isAccessTokenExpired(token, 0));
}

export function marketplaceApiBase():
  "/public/marketplace" | "/customer/marketplace" {
  return hasLiveCustomerSession()
    ? "/customer/marketplace"
    : "/public/marketplace";
}

export function productsApiBase():
  "/public/marketplace/products" | "/customer/products" {
  return hasLiveCustomerSession()
    ? "/customer/products"
    : "/public/marketplace/products";
}

export function offersApiBase():
  "/public/marketplace/offers" | "/customer/offers" {
  return hasLiveCustomerSession()
    ? "/customer/offers"
    : "/public/marketplace/offers";
}
