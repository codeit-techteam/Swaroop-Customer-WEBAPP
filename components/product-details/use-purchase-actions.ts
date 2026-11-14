"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { getAccessToken } from "@/lib/auth-session";
import { useCartStore } from "@/store/cartStore";
import { useProfileStore } from "@/store/profileStore";
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
  kycRequired: boolean;
  addToCart: () => Promise<void>;
  buyNow: () => void;
}

function looksUnauthenticated(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("unauthorized") ||
    m.includes("unauthenticated") ||
    m.includes("not authenticated") ||
    m.includes("sign in") ||
    m.includes("log in") ||
    m.includes("login required") ||
    m.includes("401")
  );
}

function looksKycBlocked(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("kyc") ||
    m.includes("kyc_not_approved") ||
    m.includes("complete your kyc")
  );
}

/** Preserve qty/offer on the product URL so guests return to the same selection. */
function purchaseReturnPath(
  productId: string,
  quantity: number,
  offerId?: string,
): string {
  const pathname =
    typeof window !== "undefined" &&
    window.location.pathname.includes(productId)
      ? window.location.pathname
      : `${ROUTES.marketplaceProduct}/${productId}`;
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  if (quantity > 0) params.set("qty", String(quantity));
  if (offerId) params.set("offer", offerId);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function redirectToLogin(
  router: ReturnType<typeof useRouter>,
  nextPath: string,
) {
  toast.message("Sign in required", {
    description:
      "Sign in to your PolyStoreX buyer account to continue with your purchase.",
  });
  router.push(`${ROUTES.login}?next=${encodeURIComponent(nextPath)}`);
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
  const kycVerified = useProfileStore((s) => s.kycVerified);
  const syncStatus = useProfileStore((s) => s.syncStatus);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const hasToken = Boolean(getAccessToken());
  const kycRequired = hasToken && syncStatus === "ready" && !kycVerified;
  const outOfStock = maxStock <= 0;
  const canAddToCart = !adding && !outOfStock && quantity > 0 && !kycRequired;
  const canBuy =
    Boolean(quote) &&
    !quoteLoading &&
    !quoteError &&
    !outOfStock &&
    quantity > 0 &&
    !kycRequired;

  useEffect(() => {
    setCartError(null);
  }, [quantity, paymentId]);

  function redirectToKyc(nextPath: string) {
    toast.message("Complete KYC first", {
      description:
        "Verified business KYC is required before cart, Buy Now, or purchase requests.",
    });
    router.push(`${ROUTES.kyc}?next=${encodeURIComponent(nextPath)}`);
  }

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

    const nextPath = purchaseReturnPath(
      productId,
      quantity,
      quote?.offerId ?? offerId,
    );
    if (!getAccessToken()) {
      redirectToLogin(router, nextPath);
      return;
    }
    if (kycRequired) {
      redirectToKyc(nextPath);
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
      if (looksUnauthenticated(result.message) || !getAccessToken()) {
        redirectToLogin(router, nextPath);
        return;
      }
      if (looksKycBlocked(result.message)) {
        redirectToKyc(nextPath);
        return;
      }
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
    const nextPath = purchaseReturnPath(
      productId,
      quantity,
      quote?.offerId ?? offerId,
    );
    if (!getAccessToken()) {
      redirectToLogin(router, nextPath);
      return;
    }
    if (kycRequired) {
      redirectToKyc(nextPath);
      return;
    }
    if (!quote) {
      const err = quoteError ?? "";
      if (looksKycBlocked(err)) {
        redirectToKyc(nextPath);
        return;
      }
      // Guests / quote failures: never surface raw 401 text.
      if (looksUnauthenticated(err)) {
        redirectToLogin(router, nextPath);
        return;
      }
      toast.error(
        err && !/401|unauthorized/i.test(err)
          ? err
          : "Unable to load latest pricing. Sign in and complete KYC to continue.",
      );
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
    kycRequired,
    addToCart,
    buyNow,
  };
}
