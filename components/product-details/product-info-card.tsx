"use client";

import type { ProductDetailRecord } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ProductInfoCardProps {
  product: ProductDetailRecord;
  className?: string;
}

const INFO_CELLS: {
  key: keyof Pick<
    ProductDetailRecord,
    | "origin"
    | "warehouseLabel"
    | "stockLabel"
    | "moqLabel"
    | "packaging"
    | "eta"
    | "materialType"
    | "casNumber"
  >;
  label: string;
}[] = [
  { key: "origin", label: "Origin" },
  { key: "warehouseLabel", label: "Warehouse" },
  { key: "stockLabel", label: "Stock" },
  { key: "moqLabel", label: "MOQ" },
  { key: "packaging", label: "Packaging" },
  { key: "eta", label: "Delivery Time" },
  { key: "materialType", label: "Material" },
  { key: "casNumber", label: "CAS Number" },
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
      <dl className="mt-3 grid grid-cols-2 gap-2.5">
        {INFO_CELLS.map((cell) => (
          <div
            key={cell.key}
            className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {cell.label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-800">
              {product[cell.key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
