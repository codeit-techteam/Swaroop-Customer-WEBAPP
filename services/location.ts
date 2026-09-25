import { env } from "@/lib/env";

const GPS_TIMEOUT_MS = 12_000;
const GEOCODER_TIMEOUT_MS = 8_000;
const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export type ResolvedGeoAddress = {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  source: "google" | "osm" | "pincode";
};

export class LocationAccessError extends Error {
  code:
    | "UNSUPPORTED"
    | "PERMISSION_DENIED"
    | "TIMEOUT"
    | "UNAVAILABLE"
    | "GEOCODE_FAILED";

  constructor(code: LocationAccessError["code"], message: string) {
    super(message);
    this.name = "LocationAccessError";
    this.code = code;
  }
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** True when the string is mostly Latin letters/digits (English place names). */
function isLatinPlaceName(value?: string | null): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  // Allow Latin letters, digits, spaces, and common place punctuation.
  return /^[\p{Script=Latin}\d\s.'’\-()/]+$/u.test(trimmed);
}

function preferEnglishName(
  primary?: string | null,
  fallback?: string | null,
): string {
  const a = primary?.trim() ?? "";
  const b = fallback?.trim() ?? "";
  if (a && isLatinPlaceName(a)) return a;
  if (b && isLatinPlaceName(b)) return b;
  return a || b;
}

function isPlaceholderMapsKey(key: string): boolean {
  return !key || key.includes("placeholder");
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new LocationAccessError("TIMEOUT", message));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type PincodeLocality = {
  name: string;
  city: string;
  state: string;
  pincode: string;
};

export async function lookupPincode(
  pincode: string,
): Promise<PincodeLocality[]> {
  const pin = pincode.replace(/\D/g, "").slice(0, 6);
  if (!INDIAN_PINCODE_REGEX.test(pin)) return [];

  try {
    const response = await withTimeout(
      fetch(`https://api.postalpincode.in/pincode/${pin}`),
      GEOCODER_TIMEOUT_MS,
      "Pincode lookup timed out.",
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as Array<{
      Status?: string;
      PostOffice?: Array<{
        Name?: string;
        District?: string;
        State?: string;
        Pincode?: string;
        Block?: string;
      }>;
    }>;
    const offices = payload[0]?.PostOffice ?? [];
    return offices
      .map((office) => ({
        name: firstNonEmpty(office.Name, office.Block),
        city: firstNonEmpty(office.District, office.Block, office.Name),
        state: firstNonEmpty(office.State),
        pincode: firstNonEmpty(office.Pincode, pin),
      }))
      .filter((entry) => entry.city && entry.state);
  } catch {
    return [];
  }
}

async function reverseGeocodeGoogle(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoAddress | null> {
  const key = env.googleMapsApiKey;
  if (isPlaceholderMapsKey(key)) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${encodeURIComponent(key)}`;
    const response = await withTimeout(
      fetch(url),
      GEOCODER_TIMEOUT_MS,
      "Taking longer than expected to resolve your location.",
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      results?: Array<{
        formatted_address?: string;
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      }>;
    };
    const result = payload.results?.[0];
    if (!result) return null;

    const pick = (type: string, short = false) => {
      const component = result.address_components?.find((entry) =>
        entry.types.includes(type),
      );
      return short ? component?.short_name : component?.long_name;
    };

    const city = firstNonEmpty(
      pick("locality"),
      pick("administrative_area_level_2"),
      pick("sublocality_level_1"),
    );
    const state = firstNonEmpty(pick("administrative_area_level_1"));
    const postalCode = firstNonEmpty(pick("postal_code"))
      .replace(/\D/g, "")
      .slice(0, 6);
    const area = firstNonEmpty(
      pick("sublocality_level_1"),
      pick("neighborhood"),
      pick("sublocality"),
    );
    const line1 = firstNonEmpty(
      [pick("street_number"), pick("route")].filter(Boolean).join(" "),
      pick("premise"),
      result.formatted_address?.split(",")[0],
      area,
      city,
    );

    if (!city && !postalCode) return null;

    return {
      label: area || "Current location",
      line1,
      line2: area && area !== city ? area : undefined,
      city: city || "India",
      state: state || "",
      postalCode,
      country: pick("country", true) ?? "IN",
      landmark: area || undefined,
      latitude,
      longitude,
      source: "google",
    };
  } catch {
    return null;
  }
}

async function reverseGeocodeOsm(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoAddress | null> {
  try {
    // Force English labels — Nominatim otherwise returns local scripts (e.g. কল্যাণী).
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`;
    const response = await withTimeout(
      fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      }),
      GEOCODER_TIMEOUT_MS,
      "Taking longer than expected to resolve your location.",
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      display_name?: string;
      address?: {
        house_number?: string;
        road?: string;
        neighbourhood?: string;
        suburb?: string;
        village?: string;
        town?: string;
        city?: string;
        county?: string;
        state_district?: string;
        state?: string;
        postcode?: string;
        country_code?: string;
      };
    };
    const address = payload.address;
    if (!address) return null;

    const city = firstNonEmpty(
      address.city,
      address.town,
      address.village,
      address.state_district,
      address.county,
    );
    const state = firstNonEmpty(address.state);
    const postalCode = firstNonEmpty(address.postcode)
      .replace(/\D/g, "")
      .slice(0, 6);
    const area = firstNonEmpty(
      address.suburb,
      address.neighbourhood,
      address.village,
    );
    const line1 = firstNonEmpty(
      [address.house_number, address.road].filter(Boolean).join(" "),
      address.road,
      area,
      payload.display_name?.split(",")[0],
      city,
    );

    if (!city && !postalCode) return null;

    return {
      label: area || "Current location",
      line1,
      line2: area && area !== city ? area : undefined,
      city: city || "India",
      state: state || "",
      postalCode,
      country: (address.country_code ?? "in").toUpperCase(),
      landmark: area || undefined,
      latitude,
      longitude,
      source: "osm",
    };
  } catch {
    return null;
  }
}

export async function reverseGeocodeCoords(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoAddress> {
  const resolved =
    (await reverseGeocodeGoogle(latitude, longitude)) ??
    (await reverseGeocodeOsm(latitude, longitude));

  if (!resolved) {
    throw new LocationAccessError(
      "GEOCODE_FAILED",
      "Found your GPS point but could not resolve a delivery address. Enter the address manually.",
    );
  }

  if (INDIAN_PINCODE_REGEX.test(resolved.postalCode)) {
    const localities = await lookupPincode(resolved.postalCode);
    const first = localities[0];
    if (first) {
      // Pincode API returns English; prefer it when geocoder used a local script
      // (e.g. Nominatim "কল্যাণী" → "Kalyani").
      return {
        ...resolved,
        city: preferEnglishName(resolved.city, first.city),
        state: preferEnglishName(resolved.state, first.state),
        line1: preferEnglishName(resolved.line1, first.name || first.city),
        landmark: preferEnglishName(resolved.landmark, first.name) || undefined,
        label: preferEnglishName(resolved.label, first.name || first.city),
      };
    }
  }

  return resolved;
}

function readBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new LocationAccessError(
          "UNSUPPORTED",
          "Location is not supported in this browser.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new LocationAccessError(
              "PERMISSION_DENIED",
              "Allow location access to auto-detect your delivery address.",
            ),
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(
            new LocationAccessError(
              "TIMEOUT",
              "Taking longer than expected to find your location.",
            ),
          );
          return;
        }
        reject(
          new LocationAccessError(
            "UNAVAILABLE",
            "Unable to read GPS right now. Enter the address manually.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

/** Resolve a 6-digit Indian pincode into a delivery address shape (parity with APP). */
export async function resolvePincodeAddress(
  pincode: string,
): Promise<ResolvedGeoAddress | null> {
  const pin = pincode.replace(/\D/g, "").slice(0, 6);
  if (!INDIAN_PINCODE_REGEX.test(pin)) return null;
  const localities = await lookupPincode(pin);
  const first = localities[0];
  if (!first) return null;
  return {
    label: first.name || first.city,
    line1: first.name || first.city,
    city: first.city,
    state: first.state,
    postalCode: first.pincode || pin,
    country: "IN",
    landmark: first.name || undefined,
    latitude: 0,
    longitude: 0,
    source: "pincode",
  };
}

/** Browser GPS + reverse geocode — same org address shape as the Customer APP. */
export async function fetchCurrentDeliveryAddress(): Promise<ResolvedGeoAddress> {
  const position = await withTimeout(
    readBrowserPosition(),
    GPS_TIMEOUT_MS + 500,
    "Taking longer than expected to find your location.",
  );

  const { latitude, longitude } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new LocationAccessError(
      "UNAVAILABLE",
      "GPS coordinates were invalid.",
    );
  }

  return reverseGeocodeCoords(latitude, longitude);
}
