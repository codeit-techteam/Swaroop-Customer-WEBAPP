"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { useCartStore } from "@/store/cartStore";
import type { CheckoutQuote } from "@/services/checkout";
import { checkoutHref, toBackendPaymentOption } from "@/services/checkout";
import type { PaymentMethodId } from "@/types/product-details";

interface UsePurchaseActionsOptions {
  productId: string;
  offerId?: string;
  packaging: string;
  quantity: number;
  maxStock: number;
  paymentId: PaymentMethodId;
  quote: CheckoutQuote | null;
  quoteLoading: boolean;
  quoteError: string | null;
}

export interface PurchaseActions {
  adding: boolean;
  cartError: string | null;
  outOfStock: boolean;
  canAddToCart: boolean;
  canBuy: boolean;
  addToCart: () => Promise<void>;
  buyNow: () => void;
}

export function usePurchaseActions({
  productId,
  offerId,
  packaging,
  quantity,
  maxStock,
  paymentId,
  quote,
  quoteLoading,
  quoteError,
}: UsePurchaseActionsOptions): PurchaseActions {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const outOfStock = maxStock <= 0;
  const canAddToCart = !adding && !outOfStock && quantity > 0;
  const canBuy =
    Boolean(quote) &&
    !quoteLoading &&
    !quoteError &&
    !outOfStock &&
    quantity > 0;

  useEffect(() => {
    setCartError(null);
  }, [quantity, paymentId]);

  async function addToCart() {
    if (outOfStock || quantity <= 0) {
      setCartError("Out of stock — cannot add to cart");
      toast.error("This grade is out of stock");
      return;
    }
    if (quantity > maxStock) {
      setCartError(`Only ${maxStock} MT available`);
      toast.error(`Quantity exceeds availability (${maxStock} MT)`);
      return;
    }
    setAdding(true);
    const result = await addItem(
      productId,
      quantity,
      packaging,
      quote?.offerId ?? offerId,
      toBackendPaymentOption(paymentId),
    );
    setAdding(false);
    if (!result.ok) {
      setCartError(result.message);
      toast.error(result.message);
      return;
    }
    setCartError(null);
    toast.success(result.message, {
      action: {
        label: "View cart",
        onClick: () => router.push(ROUTES.cart),
      },
    });
  }

  function buyNow() {
    if (!quote) {
      toast.error(quoteError ?? "Unable to load latest pricing");
      return;
    }
    router.push(checkoutHref([quote.quoteId]));
  }

  return {
    adding,
    cartError,
    outOfStock,
    canAddToCart,
    canBuy,
    addToCart,
    buyNow,
  };
}
