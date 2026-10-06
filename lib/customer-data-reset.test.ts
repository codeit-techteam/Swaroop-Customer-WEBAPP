/**
 * One browser, two accounts: the second must not see the first one's data.
 * Run: npx tsx --test lib/customer-data-reset.test.ts
 */
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  claimCustomerDataOwner,
  clearCustomerData,
} from "./customer-data-reset";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
(globalThis as { window?: unknown }).window = {
  localStorage: local,
  sessionStorage: session,
};

function seedUserA() {
  local.setItem("pt-customer-data-owner", "user-a");
  local.setItem("petrotrade.cart.v1", '{"items":[1]}');
  local.setItem("petrotrade.example-user-data.v1", "a-data");
  local.setItem("petrotrade.customer-profile.v2", '{"company":"A"}');
  local.setItem("pt-customer-onboarding", '{"gst":"27AAAAA0000A1Z5"}');
  local.setItem("swaroop-marketplace-offers-v2", '{"myOfferRecords":[1]}');
  local.setItem("pt-customer-ui", '{"sidebarCollapsed":true}');
  local.setItem("unrelated-key", "keep");
  session.setItem("petrotrade.checkout.v1", "{}");
}

describe("customer data isolation", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
    seedUserA();
  });

  it("logout removes account data but keeps device preferences", () => {
    clearCustomerData();
    assert.equal(local.getItem("petrotrade.cart.v1"), null);
    assert.equal(local.getItem("petrotrade.example-user-data.v1"), null);
    assert.equal(local.getItem("petrotrade.customer-profile.v2"), null);
    assert.equal(local.getItem("pt-customer-onboarding"), null);
    assert.equal(local.getItem("swaroop-marketplace-offers-v2"), null);
    assert.equal(local.getItem("pt-customer-data-owner"), null);
    assert.equal(session.getItem("petrotrade.checkout.v1"), null);
    assert.equal(local.getItem("pt-customer-ui"), '{"sidebarCollapsed":true}');
    assert.equal(local.getItem("unrelated-key"), "keep");
  });

  it("signing in as another user clears the previous user's data", () => {
    claimCustomerDataOwner("user-b");
    assert.equal(local.getItem("petrotrade.example-user-data.v1"), null);
    assert.equal(local.getItem("pt-customer-onboarding"), null);
    assert.equal(local.getItem("pt-customer-data-owner"), "user-b");
  });

  it("signing in again as the same user keeps their data", () => {
    claimCustomerDataOwner("user-a");
    assert.equal(local.getItem("petrotrade.example-user-data.v1"), "a-data");
  });
});
