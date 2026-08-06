"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreatePurchaseRequestButtonProps {
  productId: string;
  className?: string;
}

/** @deprecated Prefer AddToCartPanel — kept as a thin link to product cart CTA */
export function CreatePurchaseRequestButton({
  productId,
  className,
}: CreatePurchaseRequestButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "h-12 w-full rounded-xl bg-brand text-sm font-semibold hover:bg-brand-700",
        className,
      )}
    >
      <Link href={`${ROUTES.marketplaceProduct}/${productId}`}>
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        Add to Cart
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}
