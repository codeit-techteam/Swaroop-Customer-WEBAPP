"use client";

import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";

interface TrackingEmptyStateProps {
  title?: string;
  description?: string;
  showMarketplaceCta?: boolean;
}

export function TrackingEmptyState({
  title = "No purchase requests found",
  description = "Try adjusting filters, or create a request from Marketplace product details.",
  showMarketplaceCta = true,
}: TrackingEmptyStateProps) {
  const router = useRouter();
  return (
    <Card className="border-dashed border-slate-200">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <PackageOpen className="h-10 w-10 text-slate-300" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
        </div>
        {showMarketplaceCta ? (
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => router.push(ROUTES.marketplace)}
          >
            Browse Marketplace
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
