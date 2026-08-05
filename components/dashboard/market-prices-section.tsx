"use client";

import { LineChart } from "lucide-react";
import type { MarketPrice } from "@/types/dashboard";
import { MarketPriceCard } from "@/components/dashboard/market-price-card";
import { SectionTitle } from "@/components/dashboard/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MarketPricesSectionProps {
  prices: MarketPrice[];
  className?: string;
}

export function MarketPricesSection({
  prices,
  className,
}: MarketPricesSectionProps) {
  return (
    <Card className={cn("border-slate-200/80", className)}>
      <CardHeader className="pb-4">
        <SectionTitle
          title="Market Price"
          icon={<LineChart className="h-4 w-4" aria-hidden="true" />}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {prices.map((price, index) => (
            <MarketPriceCard key={price.id} price={price} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
