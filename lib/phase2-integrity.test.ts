import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toMarketplaceOffer } from "./catalog-mapper";
import {
  buildProductHighlights,
  buildProductDocuments,
} from "../mock/product-details/features";
import { materialsFromCatalog } from "./material-taxonomy";
import type { MarketplaceProduct } from "@/types/marketplace";

describe("Phase 2 frontend integrity", () => {
  it("drops bulk tiers below offer MOQ", () => {
    const offer = toMarketplaceOffer({
      id: "o1",
      price: 96000,
      moq: 12,
      quantityAvailable: 100,
      validUntil: null,
      paymentTerms: "ADVANCE",
      priceTiers: [
        { minQty: 0, maxQty: 11, price: 96000 },
        { minQty: 12, maxQty: 49, price: 94500 },
        { minQty: 50, maxQty: null, price: 93000 },
      ],
      supplier: { displayName: "ANONYMOUS SUPPLIER" },
    });
    assert.equal(
      offer.bulkTiers.every((t) => t.minMt >= 12),
      true,
    );
    assert.equal(offer.bulkTiers.length, 2);
  });

  it("never fabricates a 365-day expiry", () => {
    const offer = toMarketplaceOffer({
      id: "o2",
      price: 94500,
      moq: 12,
      quantityAvailable: 50,
      validUntil: null,
      paymentTerms: "ADVANCE",
      priceTiers: [],
      supplier: { displayName: "ANONYMOUS SUPPLIER" },
    });
    assert.equal(offer.expiresAt, null);
    assert.equal(offer.isLimitedTime, false);
  });

  it("gates Quality Documentation highlight on real docs", () => {
    assert.equal(
      buildProductHighlights(false, false).includes("Quality Documentation"),
      false,
    );
    assert.equal(
      buildProductHighlights(false, true).includes("Quality Documentation"),
      true,
    );
    assert.deepEqual(buildProductDocuments("ABS 3000D"), []);
  });

  it("maps PP and Nylon chips from live catalogue labels", () => {
    const products = [
      {
        id: "1",
        materialType: "Polypropylene",
        grade: "H110MA",
        price: 90000,
        categoryId: "polymers",
      },
      {
        id: "2",
        materialType: "Nylon 6",
        grade: "N6-GF30",
        price: 180000,
        categoryId: "polymers",
      },
    ] as MarketplaceProduct[];
    const mats = materialsFromCatalog(products);
    assert.equal(
      mats.some((m) => m.code === "PP"),
      true,
    );
    assert.equal(
      mats.some((m) => m.code === "NYLON"),
      true,
    );
  });

  it("keeps supplier identity anonymous on mapped offers", () => {
    const offer = toMarketplaceOffer({
      id: "o3",
      price: 94500,
      moq: 12,
      quantityAvailable: 20,
      validUntil: "2026-12-01T00:00:00.000Z",
      paymentTerms: "CREDIT_30",
      priceTiers: [],
      supplier: { displayName: "ANONYMOUS SUPPLIER" },
    });
    assert.equal(offer.sellerName, "ANONYMOUS SUPPLIER");
  });
});
