"use client";

import type { ProductDetailRecord } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ProductInfoCardProps {
  product: ProductDetailRecord;
  className?: string;
}

const INFO_ROWS: {
  key: keyof Pick<
    ProductDetailRecord,
    | "origin"
    | "warehouseLabel"
    | "stockLabel"
    | "moqLabel"
    | "eta"
    | "packaging"
    | "hsnCode"
    | "application"
    | "industry"
    | "grade"
    | "casNumber"
    | "materialType"
  >;
  label: string;
}[] = [
  { key: "origin", label: "Origin" },
  { key: "warehouseLabel", label: "Warehouse" },
  { key: "stockLabel", label: "Stock Status" },
  { key: "moqLabel", label: "MOQ" },
  { key: "eta", label: "Delivery Lead Time" },
  { key: "packaging", label: "Packaging Type" },
  { key: "hsnCode", label: "HSN Code" },
  { key: "application", label: "Application" },
  { key: "industry", label: "Industry" },
  { key: "grade", label: "Grade" },
  { key: "casNumber", label: "CAS Number" },
  { key: "materialType", label: "Material Type" },
];

export function ProductInfoCard({ product, className }: ProductInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Product Information
      </h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {INFO_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-3 border-b border-slate-50 py-1.5 last:border-0 sm:last:border-b"
          >
            <dt className="text-xs font-medium text-slate-400">{row.label}</dt>
            <dd className="text-right text-sm font-semibold text-slate-800">
              {product[row.key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
