/**
 * Pure helpers covered without a test runner (project has no vitest/jest yet).
 * Run: npx tsx --test lib/location-helpers.test.ts  (optional)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deliveryLocationBadge,
  formatDeliveryLabel,
  isPersistedAddressId,
  PINCODE_REGEX,
} from "../constants/locations";

describe("location helpers", () => {
  it("formats delivery labels without hardcoding Kolkata", () => {
    const label = formatDeliveryLabel({
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    });
    assert.equal(label, "Mumbai, MH 400001");
    assert.equal(label.includes("Kolkata"), false);
  });

  it("validates Indian pincode and UUID address ids", () => {
    assert.equal(PINCODE_REGEX.test("700016"), true);
    assert.equal(PINCODE_REGEX.test("000000"), false);
    assert.equal(
      isPersistedAddressId("550e8400-e29b-41d4-a716-446655440000"),
      true,
    );
    assert.equal(isPersistedAddressId("gps-current"), false);
  });

  it("maps header badges for GPS vs saved labels", () => {
    assert.equal(
      deliveryLocationBadge({
        source: "gps",
        label: "Park Street",
      }),
      "CURRENT",
    );
    assert.equal(
      deliveryLocationBadge(
        { source: "saved", label: "Home" },
        { label: "Home", type: "SHIPPING", isDefault: false },
      ),
      "HOME",
    );
    assert.equal(
      deliveryLocationBadge(
        { source: "saved", label: "Office HQ" },
        { label: "Office HQ", type: "SHIPPING", isDefault: false },
      ),
      "OFFICE",
    );
  });
});
