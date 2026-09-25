import type { DeliveryLocation } from "@/types/delivery-location";
import type { CheckoutAddress } from "@/services/checkout";

export const INDIAN_STATE_CODES: Record<string, string> = {
  "andaman and nicobar islands": "AN",
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  assam: "AS",
  bihar: "BR",
  chandigarh: "CH",
  chhattisgarh: "CG",
  delhi: "DL",
  "nct of delhi": "DL",
  goa: "GA",
  gujarat: "GJ",
  haryana: "HR",
  "himachal pradesh": "HP",
  "jammu and kashmir": "JK",
  jharkhand: "JH",
  karnataka: "KA",
  kerala: "KL",
  ladakh: "LA",
  lakshadweep: "LD",
  "madhya pradesh": "MP",
  maharashtra: "MH",
  manipur: "MN",
  meghalaya: "ML",
  mizoram: "MZ",
  nagaland: "NL",
  odisha: "OD",
  orissa: "OD",
  puducherry: "PY",
  pondicherry: "PY",
  punjab: "PB",
  rajasthan: "RJ",
  sikkim: "SK",
  "tamil nadu": "TN",
  telangana: "TS",
  tripura: "TR",
  "uttar pradesh": "UP",
  uttarakhand: "UK",
  "west bengal": "WB",
};

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const STATE_CODE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(INDIAN_STATE_CODES).map(([name, code]) => [
    code,
    titleCase(name),
  ]),
);

export function stateCodeFromName(state?: string | null): string {
  const trimmed = (state ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return (
    INDIAN_STATE_CODES[trimmed.toLowerCase()] ??
    trimmed.slice(0, 2).toUpperCase()
  );
}

export function formatDeliveryLabel(input: {
  city: string;
  state?: string;
  pincode?: string;
  area?: string;
}): string {
  const city = input.city.trim();
  const area = input.area?.trim();
  const code = stateCodeFromName(input.state);
  const pin = (input.pincode ?? "").replace(/\D/g, "").slice(0, 6);
  const locality =
    area && area.toLowerCase() !== city.toLowerCase()
      ? `${area}, ${city}`
      : city;
  const region = [code, pin].filter(Boolean).join(" ");
  return region ? `${locality}, ${region}` : locality;
}

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/** Ephemeral GPS selection — not a backend UUID until the address is saved. */
export const GPS_LOCATION_ID = "gps-current";

export const DELIVERY_LOCATION_STORAGE_KEY = "pt-customer-delivery-location.v1";

export function isPersistedAddressId(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/** Header badge: CURRENT for GPS; HOME / OFFICE / … for saved labels. */
export function deliveryLocationBadge(
  location: Pick<DeliveryLocation, "source" | "label" | "landmark"> | null,
  address?: Pick<CheckoutAddress, "label" | "type" | "isDefault"> | null,
): string {
  if (!location) return "CURRENT";
  if (location.source === "gps" || location.source === "pincode") {
    return "CURRENT";
  }

  const raw = (address?.label || location.label || "").trim().toUpperCase();
  if (raw === "HOME" || raw.includes("HOME")) return "HOME";
  if (raw === "OFFICE" || raw.includes("OFFICE")) return "OFFICE";
  if (raw === "WAREHOUSE" || raw.includes("WAREHOUSE")) return "WAREHOUSE";
  if (raw === "FACTORY" || raw.includes("FACTORY")) return "FACTORY";
  if (address?.isDefault) return "PRIMARY";
  if (address?.type === "SHIPPING") return "SHIPPING";
  if (raw && raw.length <= 12) return raw;
  return "CURRENT";
}

export function addressKindLabel(type?: string | null): string {
  switch ((type ?? "").toUpperCase()) {
    case "WAREHOUSE":
      return "Warehouse";
    case "OFFICE":
      return "Office";
    case "FACTORY":
      return "Factory";
    case "SHIPPING":
      return "Shipping";
    case "REGISTERED":
      return "Registered";
    case "BILLING":
      return "Billing";
    default:
      return "Address";
  }
}
