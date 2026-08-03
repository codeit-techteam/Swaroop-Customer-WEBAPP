"use client";

import Link from "next/link";
import { FilePlus2, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreatePurchaseRequestButtonProps {
  productId: string;
  className?: string;
}

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
      <Link href={`${ROUTES.purchaseRequestsCreate}?productId=${productId}`}>
        <FilePlus2 className="h-4 w-4" aria-hidden="true" />
        Create Purchase Request
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}
