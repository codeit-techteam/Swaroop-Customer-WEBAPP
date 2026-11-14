import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dedupeOffersByGrade,
  dedupeProductsByGrade,
  gradeKeyForProduct,
} from "./marketplace-dedupe";
import type { MarketplaceOffer } from "@/types/offers";
import type { MarketplaceProduct } from "@/types/marketplace";

function offer(
  partial: Partial<MarketplaceOffer> & Pick<MarketplaceOffer, "id">,
): MarketplaceOffer {
  return {
    slug: partial.id,
    title: "t",
    description: "",
    termsAndConditions: [],
    productId: partial.productId ?? partial.id,
    productName: "p",
    grade: partial.grade ?? "ABS",
    gradeId: partial.gradeId,
    gradeCode: partial.gradeCode,
    categoryId: "polymers",
    categoryLabel: "Polymers",
    brandId: "private",
    brandName: "PRIVATE",
    brandShortName: "PVT",
    sellerName: "ANONYMOUS SUPPLIER",
    warehouseId: "wh-all",
    warehouseLabel: "All",
    bannerImage: "",
    productImage: "",
    priceBefore: 100,
    offerPrice: 90,
    discountPercent: 10,
    savings: 10,
    moq: 1,
    availableQuantity: 10,
    remainingStock: 10,
    expiresAt: null,
    offerType: "flash_sale",
    badge: "",
    paymentTypes: [],
    creditEligible: false,
    estimatedFreight: 0,
    gstPercent: 18,
    brochureUrl: "",
    isLimitedTime: false,
    isTrending: false,
    isMostRequested: false,
    views: 0,
    requestCount: 0,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("marketplace dedupe", () => {
  it("prefers gradeId for product keys", () => {
    assert.equal(
      gradeKeyForProduct({
        gradeId: "g-1",
        gradeCode: "SO-ABS",
        grade: "ABS FR Compound",
      }),
      "g-1",
    );
  });

  it("dedupes recommended offers by gradeId not display name", () => {
    const rows = dedupeOffersByGrade([
      offer({
        id: "o1",
        gradeId: "grade-abs",
        grade: "ABS FR Compound",
        productId: "p1",
      }),
      offer({
        id: "o2",
        gradeId: "grade-abs",
        grade: "ABS FR Compound",
        productId: "p2",
      }),
      offer({
        id: "o3",
        gradeId: "grade-acetone",
        grade: "Acetone",
        productId: "p3",
      }),
    ]);
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((r) => r.id),
      ["o1", "o3"],
    );
  });

  it("keeps one marketplace card per gradeId", () => {
    const products = [
      {
        id: "p1",
        gradeId: "g1",
        grade: "ABS Injection",
        gradeCode: "A",
      },
      {
        id: "p2",
        gradeId: "g1",
        grade: "ABS Injection",
        gradeCode: "A",
      },
    ] as MarketplaceProduct[];
    assert.equal(dedupeProductsByGrade(products).length, 1);
  });
});
