import type { ComplianceDocument } from "@/types/product-details";

const FEATURES_BY_MATERIAL: Record<string, string[]> = {
  Polypropylene: [
    "High Flow",
    "Excellent Processability",
    "Virgin Material",
    "IS Certified",
    "Consistent MFI",
  ],
  HDPE: [
    "High Strength",
    "UV Resistant",
    "Virgin Material",
    "IS Certified",
    "Moisture Resistant",
  ],
  LDPE: [
    "High Clarity",
    "Flexible Film Grade",
    "Virgin Material",
    "Food Contact Eligible",
    "IS Certified",
  ],
  LLDPE: [
    "Puncture Resistant",
    "High Toughness",
    "Virgin Material",
    "IS Certified",
    "Excellent Sealability",
  ],
  PVC: [
    "Chemical Resistant",
    "Flame Retardant Options",
    "Virgin Material",
    "IS Certified",
    "Stable Processing",
  ],
  PET: [
    "High Clarity",
    "Food Grade",
    "Virgin Material",
    "IS Certified",
    "Recyclable",
  ],
};

const DEFAULT_FEATURES = [
  "Virgin Material",
  "IS Certified",
  "Quality Assured",
  "Consistent Batch Specs",
  "PolyStoreX Verified",
];

const BASE_PRODUCT_HIGHLIGHTS = [
  "Blind Marketplace",
  "Tax Invoice Available",
] as const;

/** @deprecated Prefer `buildProductHighlights()` so quality docs are gated correctly. */
export const DEFAULT_PRODUCT_HIGHLIGHTS = [...BASE_PRODUCT_HIGHLIGHTS];

export function getFeaturesForMaterial(materialType: string): string[] {
  return FEATURES_BY_MATERIAL[materialType] ?? DEFAULT_FEATURES;
}

export function buildProductHighlights(
  _creditEligible: boolean,
  hasQualityDocs = false,
): string[] {
  return hasQualityDocs
    ? [...BASE_PRODUCT_HIGHLIGHTS, "Quality Documentation"]
    : [...BASE_PRODUCT_HIGHLIGHTS];
}

/** Optional product downloads — only TDS and MSDS are supported on PDP. */
export function buildProductDocuments(
  productName: string,
): ComplianceDocument[] {
  const safe = productName.replace(/\s+/g, "-").toLowerCase();
  return [
    {
      id: "doc-tds",
      type: "test_certificate",
      title: "TDS",
      description: "Technical data sheet",
      fileName: `${safe}-tds.pdf`,
    },
    {
      id: "doc-msds",
      type: "msds",
      title: "MSDS",
      description: "Material safety data sheet",
      fileName: `${safe}-msds.pdf`,
    },
  ];
}
