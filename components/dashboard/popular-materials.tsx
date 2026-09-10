"use client";

import { materialsTaxonomy } from "@/mock/materials-taxonomy";
import { MaterialTile } from "@/components/marketplace/material-tile";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

const POPULAR_CODES = [
  "PP",
  "HDPE",
  "LDPE",
  "LLDPE",
  "PET",
  "PVC",
  "ABS",
  "PA",
  "MB",
  "ACE",
  "IPA",
  "SOL",
];

interface PopularMaterialsProps {
  className?: string;
}

export function PopularMaterials({ className }: PopularMaterialsProps) {
  const materials = POPULAR_CODES.map((code) =>
    materialsTaxonomy.find((item) => item.code === code),
  ).filter(Boolean) as typeof materialsTaxonomy;

  return (
    <section className={cn("space-y-4", className)}>
      <SectionTitle
        title="Popular Materials"
        actionLabel="Browse All"
        actionHref={ROUTES.marketplace}
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {materials.map((material) => (
          <MaterialTile key={material.id} material={material} />
        ))}
      </div>
    </section>
  );
}
