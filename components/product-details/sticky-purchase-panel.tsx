"use client";

import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInr } from "@/lib/format";
import type { CheckoutQuote } from "@/services/checkout";
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
import type { PurchaseActions } from "./use-purchase-actions";

interface StickyPurchasePanelProps {
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
  availabilityLabel: string;
  eta: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onSelectTier: (tier: BulkPricingTier) => void;
  actions: PurchaseActions;
  /** Attached to the checkout footer so the page can tell when the CTAs are on screen */
  actionsRef?: Ref<HTMLDivElement>;
  className?: string;
}

function AvailabilityChip({
  label,
  outOfStock,
}: {
  label: string;
  outOfStock: boolean;
}) {
  const limited = /limited|low/i.test(label);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/20">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          outOfStock
            ? "bg-rose-400"
            : limited
              ? "bg-amber-300"
              : "bg-emerald-400",
        )}
        aria-hidden="true"
      />
      {outOfStock ? "Out of stock" : label}
    </span>
  );
}

function useScrollEndHint<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [hasMore, setHasMore] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setHasMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [update]);

  return { ref, hasMore, onScroll: update };
}

const STICKY_TOP_PX = 80;
const VIEWPORT_GAP_PX = 16;
const MIN_PANEL_HEIGHT_PX = 420;

/**
 * Caps the panel to the space between its current top edge and the viewport
 * bottom, so the checkout footer is on screen both at rest and once stuck.
 */
function useFitToViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1280px)");
    let frame = 0;

    const fit = () => {
      frame = 0;
      if (!desktop.matches) {
        el.style.maxHeight = "";
        return;
      }
      const top = Math.max(el.getBoundingClientRect().top, STICKY_TOP_PX);
      const available = window.innerHeight - top - VIEWPORT_GAP_PX;
      el.style.maxHeight = `${Math.max(available, MIN_PANEL_HEIGHT_PX)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };

    fit();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);

  return ref;
}

export function StickyPurchasePanel({
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
  availabilityLabel,
  eta,
  quantity,
  onQuantityChange,
  onSelectTier,
  actions,
  actionsRef,
  className,
}: StickyPurchasePanelProps) {
  const [qtyError, setQtyError] = useState<string | null>(null);
  const { adding, cartError, outOfStock, canAddToCart, canBuy } = actions;
  const scroll = useScrollEndHint<HTMLDivElement>();
  const cardRef = useFitToViewport<HTMLDivElement>();
  const minQty = maxStock > 0 ? Math.min(moq, maxStock) : 0;
  const discount = quote ? Number(quote.discountAmount) : 0;
  const refreshing = quoteLoading && Boolean(quote);

  function clamp(next: number) {
    if (maxStock <= 0) return 0;
    return Math.max(minQty, Math.min(maxStock, Math.round(next)));
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

  const inlineError = qtyError ?? cartError;

  return (
    <aside
      aria-label="Purchase options"
      className={cn("xl:sticky xl:top-20", className)}
    >
      <div
        ref={cardRef}
        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card xl:max-h-[calc(100dvh-6rem)]"
      >
        <SpotPriceCard
          className="shrink-0 rounded-none border-0 !shadow-none"
          spotPrice={
            quote
              ? { ...spotPrice, pricePerMt: Number(quote.unitPrice) }
              : spotPrice
          }
          badge={
            <AvailabilityChip
              label={availabilityLabel}
              outOfStock={outOfStock}
            />
          }
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scroll.ref}
            onScroll={scroll.onScroll}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 [scrollbar-width:thin]"
          >
            <section aria-labelledby="pdp-qty-label">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p
                  id="pdp-qty-label"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Quantity (MT)
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  MOQ {moq} · {maxStock} available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 min-h-10 w-10 min-w-10 shrink-0 rounded-xl"
                  disabled={outOfStock || quantity <= minQty}
                  onClick={() => changeQty(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={minQty}
                  max={maxStock}
                  step={1}
                  value={quantity}
                  disabled={outOfStock}
                  aria-labelledby="pdp-qty-label"
                  aria-invalid={Boolean(inlineError)}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    if (Number.isFinite(parsed)) changeQty(parsed);
                  }}
                  className="h-10 rounded-xl text-center text-base font-semibold tabular-nums"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 min-h-10 w-10 min-w-10 shrink-0 rounded-xl"
                  disabled={outOfStock || quantity >= maxStock}
                  onClick={() => changeQty(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {outOfStock ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  Out of stock — ordering resumes once stock is replenished.
                </p>
              ) : inlineError ? (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                  {inlineError}
                </p>
              ) : null}
            </section>

            <BulkPricingCard
              className="rounded-xl border-slate-100 p-3 !shadow-none"
              tiers={bulkPricing}
              quantity={quantity}
              onSelectTier={onSelectTier}
            />

            <PaymentOptionsCard
              options={paymentOptions}
              selectedId={paymentId}
              onSelect={onPaymentChange}
              compact
            />

            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
              <Truck
                className="h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />
              <p className="text-xs text-slate-600">
                Delivery in{" "}
                <span className="font-semibold text-slate-900">
                  {eta?.trim() || "4–6 Business Days"}
                </span>
              </p>
            </div>

            <BuyingSummary
              quote={quote}
              loading={quoteLoading}
              error={quoteError}
              hideTotal
            />

            <TrustBadges className="border-0 p-0 !shadow-none" />

            <p className="text-[11px] leading-relaxed text-slate-400">
              Totals come from the latest PetroTrade quote. Payment is collected
              after seller response, commercial acceptance, and proforma
              invoice.
            </p>

            <Link
              href={ROUTES.marketplace}
              className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-brand"
            >
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              Continue Shopping
            </Link>
          </div>

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200",
              scroll.hasMore ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
        </div>

        <div
          ref={actionsRef}
          className="shrink-0 border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-[0_-10px_24px_-14px_rgba(15,23,42,0.22)]"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Grand Total
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {quantity} MT · incl. GST &amp; freight
              </p>
            </div>
            <div className="flex items-center gap-1.5" aria-live="polite">
              {refreshing ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-slate-400"
                  aria-label="Updating price"
                />
              ) : null}
              {quote ? (
                <p
                  className={cn(
                    "text-xl font-bold tabular-nums leading-none text-brand transition-opacity",
                    refreshing && "opacity-60",
                  )}
                >
                  {formatInr(Number(quote.totalAmount), { compact: true })}
                </p>
              ) : quoteLoading ? (
                <span className="h-5 w-24 animate-pulse rounded-md bg-slate-200" />
              ) : (
                <p className="text-xl font-bold leading-none text-slate-300">
                  —
                </p>
              )}
            </div>
          </div>

          {discount > 0 ? (
            <p className="mt-1 text-right text-[11px] font-semibold text-emerald-700">
              You save {formatInr(discount, { compact: true })}
            </p>
          ) : null}

          {outOfStock ? (
            <Button
              type="button"
              disabled
              className="mt-3 h-11 w-full rounded-xl text-sm font-semibold"
            >
              Out Of Stock
            </Button>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-brand/30 px-2 text-sm font-semibold text-brand hover:bg-brand/5 hover:text-brand"
                onClick={() => void actions.addToCart()}
                disabled={!canAddToCart}
              >
                {adding ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                )}
                {adding ? "Adding…" : "Add to Cart"}
              </Button>
              <Button
                type="button"
                className="group h-11 rounded-xl bg-brand px-2 text-sm font-semibold hover:bg-brand-700"
                onClick={actions.buyNow}
                disabled={!canBuy}
              >
                {quoteLoading && !quote ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                Buy Now
                {!quoteLoading ? (
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                ) : null}
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

interface MobileBuyBarProps {
  visible: boolean;
  quantity: number;
  totalLabel: string;
  actions: PurchaseActions;
}

export function MobileBuyBar({
  visible,
  quantity,
  totalLabel,
  actions,
}: MobileBuyBarProps) {
  const { adding, outOfStock, canAddToCart, canBuy } = actions;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden"
        >
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total · {quantity} MT
              </p>
              <p className="truncate text-base font-bold tabular-nums text-brand">
                {totalLabel}
              </p>
            </div>
            {outOfStock ? (
              <Button
                type="button"
                disabled
                className="h-11 shrink-0 rounded-xl px-5 text-sm font-semibold"
              >
                Out Of Stock
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 min-h-11 w-11 min-w-11 shrink-0 rounded-xl border-brand/30 text-brand hover:bg-brand/5 hover:text-brand"
                  onClick={() => void actions.addToCart()}
                  disabled={!canAddToCart}
                  aria-label="Add to cart"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  className="h-11 shrink-0 rounded-xl bg-brand px-5 text-sm font-semibold hover:bg-brand-700"
                  onClick={actions.buyNow}
                  disabled={!canBuy}
                >
                  Buy Now
                </Button>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
