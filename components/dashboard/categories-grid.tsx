"use client";

import type { CategoryCardItem } from "@/types/dashboard";
import { CategoryCard } from "@/components/dashboard/category-card";
import { SectionTitle } from "@/components/dashboard/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoriesGridProps {
  categories: CategoryCardItem[];
  className?: string;
}

export function CategoriesGrid({ categories, className }: CategoriesGridProps) {
  return (
    <Card className={cn("border-slate-200/80", className)}>
      <CardHeader className="pb-3">
        <SectionTitle title="Browse Categories" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
