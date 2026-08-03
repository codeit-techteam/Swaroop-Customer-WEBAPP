import type { ProductSpecRow } from "@/types/product-details";

/** Technical specifications — mirrors Customer App DEFAULT_SPECS, extended for desktop. */
export const DEFAULT_PRODUCT_SPECS: ProductSpecRow[] = [
  {
    id: "mfi",
    label: "Melt Flow Index (MFI)",
    value: "3.5 g/10 min",
    standard: "ASTM D1238 (230°C/2.16kg)",
  },
  {
    id: "tensile",
    label: "Tensile Strength at Yield",
    value: "35 MPa",
    standard: "At Yield (50mm/min)",
  },
  {
    id: "density",
    label: "Density",
    value: "0.90 g/cm³",
    standard: "ASTM D792",
  },
  {
    id: "flexural",
    label: "Flexural Modulus",
    value: "1450 MPa",
    standard: "ASTM D790",
  },
  {
    id: "melting",
    label: "Melting Point",
    value: "165 °C",
    standard: "DSC Peak",
  },
  {
    id: "impact",
    label: "Impact Resistance",
    value: "High",
    standard: "ASTM D256",
  },
  {
    id: "moisture",
    label: "Moisture",
    value: "< 0.05%",
    standard: "Karl Fischer",
  },
  {
    id: "particle",
    label: "Particle Size",
    value: "2–3 mm",
    standard: "Sieve Analysis",
  },
];

export const SPECS_BY_MATERIAL: Partial<Record<string, ProductSpecRow[]>> = {
  HDPE: [
    {
      id: "mfi",
      label: "Melt Flow Index (MFI)",
      value: "0.25 g/10 min",
      standard: "ASTM D1238",
    },
    {
      id: "density",
      label: "Density",
      value: "0.955 g/cm³",
      standard: "ASTM D792",
    },
    {
      id: "tensile",
      label: "Tensile Strength at Yield",
      value: "28 MPa",
      standard: "ASTM D638",
    },
    {
      id: "flexural",
      label: "Flexural Modulus",
      value: "1200 MPa",
      standard: "ASTM D790",
    },
    {
      id: "melting",
      label: "Melting Point",
      value: "130 °C",
      standard: "DSC Peak",
    },
    {
      id: "impact",
      label: "Impact Resistance",
      value: "Very High",
      standard: "ASTM D256",
    },
    {
      id: "moisture",
      label: "Moisture",
      value: "< 0.04%",
      standard: "Karl Fischer",
    },
    {
      id: "particle",
      label: "Particle Size",
      value: "2–4 mm",
      standard: "Sieve Analysis",
    },
  ],
};

export function getSpecsForMaterial(materialType: string): ProductSpecRow[] {
  return SPECS_BY_MATERIAL[materialType] ?? DEFAULT_PRODUCT_SPECS;
}
