import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSampleAdminPush } from "./sample-admin-pushes";

describe("sample admin pushes", () => {
  it("matches the three client-reported sample notifications", () => {
    assert.equal(
      isSampleAdminPush({
        id: "PSH-2401",
        title: "Monsoon bulk rates are live",
      }),
      true,
    );
    assert.equal(
      isSampleAdminPush({
        id: "PSH-2403",
        title: "GST invoices for August are ready",
      }),
      true,
    );
    assert.equal(
      isSampleAdminPush({
        id: "PSH-2404",
        title: "Navratri procurement window opens 22 Sept",
      }),
      true,
    );
  });

  it("keeps a real account notification", () => {
    assert.equal(
      isSampleAdminPush({
        id: "8f1c2b0a-6d4e-4a1b-9c2d-111111111111",
        title: "Purchase request submitted",
      }),
      false,
    );
  });
});
