/**
 * Run: npx tsx --test lib/fulfilment.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deliveryEstimateCopy,
  dispatchWindowCopy,
  hasDestinationPincode,
} from "./fulfilment";
import {
  CREDIT_LOAD_ERROR,
  GUEST_CREDIT_ACCESS,
  guestCreditAccess,
  shouldRenderCreditInfo,
} from "../types/payment-eligibility";
import { mapBackendPaymentOptions } from "../hooks/use-customer-quote";

describe("deliveryEstimateCopy", () => {
  it("uses seller delivery terms when present", () => {
    const copy = deliveryEstimateCopy({
      fulfilment: {
        warehouse: {
          label: "Bhiwandi",
          city: "Bhiwandi",
          state: "Maharashtra",
        },
        origin: "India",
        dispatchWindow: { label: "24 Hours", source: "OFFER_METADATA" },
        deliveryEstimate: {
          label: "4–6 Business Days",
          source: "SELLER_TERMS",
        },
        destinationAware: false,
        hsnCode: null,
      },
    });
    assert.equal(copy.status, "ready");
    assert.equal(copy.label, "4–6 Business Days");
  });

  it("does not invent an ETA when data is missing", () => {
    const missingPincode = deliveryEstimateCopy({
      fulfilment: {
        warehouse: { label: "Bhiwandi", city: "Bhiwandi", state: null },
        origin: "India",
        dispatchWindow: null,
        deliveryEstimate: null,
        destinationAware: false,
        hsnCode: null,
      },
    });
    assert.equal(missingPincode.status, "need_pincode");
    assert.equal(
      missingPincode.label,
      "Enter delivery pincode for an estimate.",
    );

    const withPincode = deliveryEstimateCopy({
      fulfilment: {
        warehouse: null,
        origin: null,
        dispatchWindow: null,
        deliveryEstimate: null,
        destinationAware: false,
        hsnCode: null,
      },
      destinationPincode: "400001",
    });
    assert.equal(withPincode.status, "unavailable");
    assert.equal(withPincode.label, "Delivery estimate unavailable");
    assert.equal(dispatchWindowCopy(null), "Dispatch time unavailable");
    assert.equal(hasDestinationPincode("400001"), true);
  });
});

describe("mapBackendPaymentOptions", () => {
  it("keeps locked credit tenures visible so buyers can Request Credit", () => {
    const mapped = mapBackendPaymentOptions([
      {
        paymentOption: "ADVANCE",
        title: "Advance",
        description: "Pay against PI",
        benefitLabel: "Save 5% with advance payment",
        eligible: true,
        discountBps: 500,
      },
      {
        paymentOption: "CREDIT_30",
        title: "Credit 30 Days",
        description: "Credit",
        benefitLabel: "Request Credit to unlock",
        eligible: false,
        discountBps: 0,
      },
    ]);
    assert.deepEqual(
      mapped.map((row) => row.id),
      ["advance", "credit_30"],
    );
    assert.equal(mapped[1]?.eligible, false);
    assert.equal(mapped[1]?.benefitLabel, "Request Credit to unlock");
    assert.equal(GUEST_CREDIT_ACCESS.canApply, true);
    assert.equal(GUEST_CREDIT_ACCESS.title, "Business Credit Available");
    assert.equal(
      mapBackendPaymentOptions([
        {
          paymentOption: "CREDIT_15",
          title: "",
          description: "",
          benefitLabel: null,
          eligible: true,
          discountBps: 0,
        },
      ]).length,
      0,
    );
  });
});

describe("shouldRenderCreditInfo", () => {
  it("hides empty credit cards and guest CTAs when the product opts out", () => {
    assert.equal(shouldRenderCreditInfo(GUEST_CREDIT_ACCESS), true);
    assert.equal(
      shouldRenderCreditInfo(
        guestCreditAccess({ supported: false, tenureDays: [] }),
      ),
      false,
    );
    assert.equal(CREDIT_LOAD_ERROR.canApply, false);
    assert.equal(CREDIT_LOAD_ERROR.reason, "CREDIT_STATUS_UNAVAILABLE");
  });
});
