import { getAccessToken } from "@/lib/auth-session";

/**
 * Guests use public marketplace reads; authenticated customers keep the
 * customer-scoped paths (same blind payloads + future personalization hooks).
 */
export function marketplaceApiBase():
  "/public/marketplace" | "/customer/marketplace" {
  return getAccessToken() ? "/customer/marketplace" : "/public/marketplace";
}

export function productsApiBase():
  "/public/marketplace/products" | "/customer/products" {
  return getAccessToken()
    ? "/customer/products"
    : "/public/marketplace/products";
}

export function offersApiBase():
  "/public/marketplace/offers" | "/customer/offers" {
  return getAccessToken() ? "/customer/offers" : "/public/marketplace/offers";
}
