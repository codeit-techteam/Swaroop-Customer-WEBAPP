"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const wishlistIds = useProductStore((s) => s.wishlistIds);
  const toggleWishlist = useProductStore((s) => s.toggleWishlist);
  const isWishlisted = wishlistIds.includes(productId);

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-11 w-full rounded-xl text-sm font-semibold", className)}
      onClick={() => {
        toggleWishlist(productId);
        toast.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        );
      }}
    >
      <Heart
        className={cn("h-4 w-4", isWishlisted && "fill-current text-red-500")}
      />
      {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
    </Button>
  );
}
