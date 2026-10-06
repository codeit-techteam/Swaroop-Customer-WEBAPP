import { AUTH_STORAGE_KEY } from "@/lib/auth-session";

const USER_DATA_PREFIXES = [
  "petrotrade.",
  "pt-customer-",
  "swaroop-marketplace-",
];

/** Device-level keys that hold no account data, or are managed by the auth session. */
const KEEP_KEYS = new Set([
  "pt-customer-ui",
  "pt-customer-session-expired",
  "pt-customer-token-refresh",
  "pt-customer-access-token",
  AUTH_STORAGE_KEY,
]);

const OWNER_KEY = "pt-customer-data-owner";

function clearStorageArea(storage: Storage): void {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (
      key &&
      !KEEP_KEYS.has(key) &&
      USER_DATA_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      keys.push(key);
    }
  }
  keys.forEach((key) => storage.removeItem(key));
}

/**
 * Removes every persisted customer store (cart, orders, documents, KYC/profile,
 * onboarding, payments…) from this browser and resets the in-memory copies, so
 * the next account never sees this one's data.
 */
export function clearCustomerData(): void {
  if (typeof window === "undefined") return;
  clearStorageArea(window.localStorage);
  clearStorageArea(window.sessionStorage);
  void import("@/store/reset-customer-stores")
    .then(({ resetCustomerStores }) => resetCustomerStores())
    .catch(() => undefined);
}

/**
 * Records which user the browser's customer data belongs to. Signing in as a
 * different (or unknown) user first clears what the previous one left behind.
 */
export function claimCustomerDataOwner(userId: string): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(OWNER_KEY) !== userId) clearCustomerData();
  window.localStorage.setItem(OWNER_KEY, userId);
}
