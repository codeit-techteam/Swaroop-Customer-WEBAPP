import { categoriesMock } from "@/mock/categories";
import { getProductById, productsMock } from "@/mock/products";
import {
  buildProductDocuments,
  buildProductHighlights,
  getFeaturesForMaterial,
} from "./features";
import { buildGalleryFromProduct, DEFAULT_QUALITY_ASSURANCE } from "./gallery";
import {
  buildBulkPricing,
  buildPaymentOptions,
  buildSpotPrice,
} from "./pricing";
import { getSpecsForMaterial } from "./specifications";
import { buildLogisticsEstimate } from "./warehouse";
import type {
  ProductAvailabilityLevel,
  ProductDetailRecord,
} from "@/types/product-details";

function availabilityFromStock(
  stock: number,
  status: "in_stock" | "limited" | "out_of_stock",
): { level: ProductAvailabilityLevel; label: string } {
  if (status === "out_of_stock" || stock <= 0) {
    return { level: "out_of_stock", label: "OUT OF STOCK" };
  }
  if (status === "limited" || stock < 100) {
    return { level: "limited", label: "LIMITED STOCK" };
  }
  if (stock >= 400) {
    return { level: "high", label: "HIGH AVAILABILITY" };
  }
  return { level: "medium", label: "IN STOCK" };
}

function buildSku(product: {
  brandShortName: string;
  grade: string;
  id: string;
  warehouseLabel: string;
}): string {
  const brand = product.brandShortName.slice(0, 3).toUpperCase();
  const grade = product.grade.replace(/\s+/g, "").toUpperCase();
  const loc =
    product.warehouseLabel.split(",")[0]?.slice(0, 3).toUpperCase() ?? "IND";
  const suffix =
    product.id.split("-").pop()?.slice(0, 4).toUpperCase() ?? "001";
  return `${brand}-${grade}-${suffix}-${loc}`;
}

/**
 * Builds full PDP record from marketplace catalog — Customer App fields first,
 * desktop design enrichments (SKU, gallery, docs, logistics) layered on top.
 */
export function getProductDetailById(id: string): ProductDetailRecord | null {
  const product = getProductById(id);
  if (!product) return null;

  const category =
    categoriesMock.find((item) => item.id === product.categoryId) ??
    categoriesMock[0]!;
  const moq = Math.max(product.moq, 25);
  const availability = availabilityFromStock(
    product.stock,
    product.stockStatus,
  );
  const relatedProductIds = productsMock
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId === product.categoryId ||
          item.materialType === product.materialType),
    )
    .slice(0, 8)
    .map((item) => item.id);

  return {
    id: product.id,
    sku: buildSku(product),
    name: product.name,
    brandName: product.brandName,
    brandShortName: product.brandShortName,
    manufacturer: product.brandName,
    categoryId: product.categoryId,
    categoryName: category.name,
    categorySlug: category.slug,
    materialType: product.materialType,
    grade: product.grade,
    description: product.description,
    casNumber: product.casNumber,
    hsnCode: "3902.10.00",
    application: product.applications[0] ?? product.materialType,
    applications: product.applications,
    features: getFeaturesForMaterial(product.materialType),
    highlights: buildProductHighlights(product.creditEligible),
    industry: "Petrochemicals & Packaging",
    packaging: "25 KG Bags",
    origin: product.origin,
    warehouseId: product.warehouseId,
    warehouseLabel: product.warehouseLabel,
    stock: product.stock,
    stockLabel:
      product.stock >= 400
        ? `${product.stock}+ MT Available`
        : `${product.stock.toLocaleString("en-IN")} MT Available`,
    moq,
    moqLabel: `${moq} MT (1 Truckload)`,
    eta: product.eta,
    availability: availability.level,
    availabilityLabel: availability.label,
    gallery: buildGalleryFromProduct(product.image, product.name),
    quality: {
      ...DEFAULT_QUALITY_ASSURANCE,
      subtitle:
        "Issued Through PetroTrade Quality Assurance · Verified By PetroTrade QC · NABL Approved Laboratory",
    },
    specs: getSpecsForMaterial(product.materialType),
    documents: buildProductDocuments(product.name),
    spotPrice: buildSpotPrice(product.price),
    bulkPricing: buildBulkPricing(product.price),
    paymentOptions: buildPaymentOptions(product.creditEligible),
    logistics: buildLogisticsEstimate({
      warehouseLabel: product.warehouseLabel,
      eta: product.eta,
    }),
    relatedProductIds,
    creditEligible: product.creditEligible,
  };
}

export { productsMock as productCatalogMock };
