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
  gradeCode?: string;
  grade: string;
  id: string;
}): string {
  if (product.gradeCode) return product.gradeCode;
  const grade = product.grade.replace(/\s+/g, "").toUpperCase();
  const suffix =
    product.id.split("-").pop()?.slice(0, 4).toUpperCase() ?? "001";
  return `${grade}-${suffix}`;
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
  const moq = product.moq;
  const availability = availabilityFromStock(
    product.stock,
    product.stockStatus,
  );
  const relatedProductIds = productsMock
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId === product.categoryId ||
          item.materialType === product.materialType ||
          item.grade === product.grade),
    )
    .slice(0, 8)
    .map((item) => item.id);

  const techSpecs = product.technicalSpecs
    ? Object.entries(product.technicalSpecs)
        .filter(([, value]) => Boolean(value))
        .map(([key, value], index) => ({
          id: `tech-${key}-${index}`,
          label:
            key === "mfi"
              ? "MFI"
              : key === "iv"
                ? "IV"
                : key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: value!,
          standard: "Grade Specification",
        }))
    : getSpecsForMaterial(product.materialType);

  return {
    id: product.id,
    sku: buildSku(product),
    name: product.name,
    brandName: "Verified Supply",
    brandShortName: "PETROTRADE",
    manufacturer: "PetroTrade Network",
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
    moqLabel: `${moq} MT`,
    eta: product.eta,
    availability: availability.level,
    availabilityLabel: availability.label,
    gallery: buildGalleryFromProduct(product.image, product.name),
    quality: {
      ...DEFAULT_QUALITY_ASSURANCE,
      subtitle:
        "Issued Through PetroTrade Quality Assurance · Verified By PetroTrade QC · NABL Approved Laboratory",
    },
    specs: techSpecs,
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
