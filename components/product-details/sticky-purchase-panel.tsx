"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import type { CheckoutQuote } from "@/services/checkout";
import { checkoutHref, toBackendPaymentOption } from "@/services/checkout";
import type {
  BulkPricingTier,
  PaymentMethodId,
  PaymentOption,
  SpotPriceInfo,
} from "@/types/product-details";
import { cn } from "@/lib/utils";
import { BulkPricingCard } from "./bulk-pricing-card";
import { BuyingSummary } from "./buying-summary";
import { PaymentOptionsCard } from "./payment-options-card";
import { SpotPriceCard } from "./spot-price-card";
import { TrustBadges } from "./trust-badges";

interface StickyPurchasePanelProps {
  productId: string;
  offerId?: string;
  spotPrice: SpotPriceInfo;
  bulkPricing: BulkPricingTier[];
  paymentOptions: PaymentOption[];
  paymentId: PaymentMethodId;
  onPaymentChange: (id: PaymentMethodId) => void;
  quote: CheckoutQuote | null;
  quoteLoading: boolean;
  quoteError: string | null;
  moq: number;
  maxStock: number;
  packaging: string;
  availabilityLabel: string;
  eta: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onSelectTier: (tier: BulkPricingTier) => void;
  className?: string;
}

export function StickyPurchasePanel({
  productId,
  offerId,
  spotPrice,
  bulkPricing,
  paymentOptions,
  paymentId,
  onPaymentChange,
  quote,
  quoteLoading,
  quoteError,
  moq,
  maxStock,
  packaging,
  availabilityLabel,
  eta,
  quantity,
  onQuantityChange,
  onSelectTier,
  className,
}: StickyPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const outOfStock = maxStock <= 0;
  const canBuy =
    Boolean(quote) &&
    !quoteLoading &&
    !quoteError &&
    !outOfStock &&
    quantity > 0;

  function clamp(next: number) {
    if (maxStock <= 0) return 0;
    const floor = Math.min(moq, maxStock);
    return Math.max(floor, Math.min(maxStock, Math.round(next)));
  }

  function changeQty(next: number) {
    if (maxStock <= 0) {
      setQtyError("Out of stock — quantity unavailable");
      onQuantityChange(0);
      return;
    }
    if (next < moq) {
      setQtyError(`Minimum order is ${moq} MT`);
      onQuantityChange(clamp(moq));
      return;
    }
    if (next > maxStock) {
      setQtyError(`Only ${maxStock} MT available`);
      onQuantityChange(maxStock);
      return;
    }
    setQtyError(null);
    onQuantityChange(clamp(next));
  }

  async function handleAddToCart() {
    if (outOfStock || quantity <= 0) {
      setQtyError("Out of stock — cannot add to cart");
      toast.error("This grade is out of stock");
      return;
    }
    if (quantity > maxStock) {
      setQtyError(`Only ${maxStock} MT available`);
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
      setQtyError(result.message);
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  }

  function handleBuyNow() {
    if (!quote) {
      toast.error(quoteError ?? "Unable to load latest pricing");
      return;
    }
    router.push(checkoutHref([quote.quoteId]));
  }

  return (
    <aside
      className={cn(
        "space-y-3 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pb-2",
        className,
      )}
    >
      <SpotPriceCard
        spotPrice={
          quote
            ? { ...spotPrice, pricePerMt: Number(quote.unitPrice) }
            : spotPrice
        }
      />
      <BulkPricingCard
        tiers={bulkPricing}
        quantity={quantity}
        onSelectTier={onSelectTier}
      />

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quantity (MT)
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 min-h-11 w-11 min-w-11 shrink-0 rounded-xl"
              disabled={
                outOfStock ||
                quantity <= (maxStock > 0 ? Math.min(moq, maxStock) : 0)
              }
              onClick={() => changeQty(quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={outOfStock ? 0 : Math.min(moq, maxStock)}
              max={maxStock}
              step={1}
              value={quantity}
              disabled={outOfStock}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                if (Number.isFinite(parsed)) changeQty(parsed);
              }}
              className="h-11 rounded-xl text-center text-base font-semibold"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 min-h-11 w-11 min-w-11 shrink-0 rounded-xl"
              disabled={outOfStock || quantity >= maxStock}
              onClick={() => changeQty(quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            MOQ {moq} MT · Available {maxStock} MT
          </p>
          {outOfStock ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              Out of stock — update unavailable until stock is replenished.
            </p>
          ) : null}
          {qtyError ? (
            <p className="mt-1 text-xs text-red-600">{qtyError}</p>
          ) : null}
        </div>

        <PaymentOptionsCard
          options={paymentOptions}
          selectedId={paymentId}
          onSelect={onPaymentChange}
          compact
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Availability
            </p>
            <p className="mt-0.5 text-xs font-semibold text-emerald-700">
              {availabilityLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Delivery ETA
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">
              {eta?.trim() || "4–6 Business Days"}
            </p>
          </div>
        </div>

        <BuyingSummary
          quote={quote}
          loading={quoteLoading}
          error={quoteError}
        />

        <div className="space-y-2">
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-brand text-sm font-semibold hover:bg-brand-700"
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? "Out Of Stock" : adding ? "Adding..." : "Add To Cart"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl text-sm font-semibold"
            onClick={handleBuyNow}
            disabled={!canBuy}
          >
            <ShoppingBag className="h-4 w-4" />
            {quoteLoading ? "Loading latest price..." : "Buy Now"}
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-10 w-full rounded-xl text-xs font-medium text-slate-500"
          >
            <Link href={ROUTES.marketplace}>
              <Store className="h-3.5 w-3.5" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Totals come from the latest PetroTrade quote. Payment is collected
          after seller response, commercial acceptance, and proforma invoice.
        </p>
      </div>

      <TrustBadges />
    </aside>
  );
}

interface MobileBuyBarProps {
  quantity: number;
  totalLabel: string;
  onBuyNow: () => void;
  disabled?: boolean;
}

export function MobileBuyBar({
  quantity,
  totalLabel,
  onBuyNow,
  disabled = false,
}: MobileBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Est. total · {quantity} MT
          </p>
          <p className="truncate text-base font-bold tabular-nums text-brand">
            {totalLabel}
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-xl bg-brand px-5 text-sm font-semibold hover:bg-brand-700"
          onClick={onBuyNow}
          disabled={disabled}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
