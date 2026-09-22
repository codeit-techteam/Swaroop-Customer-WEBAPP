"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  FileText,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckoutValidationDialog,
  NetworkErrorDialog,
  PriceUpdatedDialog,
} from "@/components/checkout";
import { ROUTES } from "@/constants";
import { commerceErrorCopy } from "@/lib/commerce-errors";
import { formatInr, formatInrPerMt, formatQuantityMt } from "@/lib/format";
import {
  checkoutErrorCode,
  checkoutErrorMessage,
  checkoutHref,
  quoteCartForCheckout,
  type CartPriceChange,
  type CartQuoteResult,
} from "@/services/checkout";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";

export function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const fetchCart = useCartStore((s) => s.fetchCart);
  const activePurchaseOrder = useCheckoutStore((s) => s.activePurchaseOrder);
  const checkoutLock = useRef(false);
  const pendingQuote = useRef<CartQuoteResult | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [priceChanges, setPriceChanges] = useState<CartPriceChange[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [validationIssue, setValidationIssue] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const goToCheckout = useCallback(
    (next: CartQuoteResult) => {
      const ids = next.quotes.map((quote) => quote.quoteId);
      if (!ids[0]) return;
      router.push(checkoutHref(ids));
    },
    [router],
  );

  const handleCheckout = useCallback(async () => {
    if (checkoutLock.current || items.length === 0) return;
    checkoutLock.current = true;
    setCheckingOut(true);
    try {
      const next = await quoteCartForCheckout({
        expectedPrices: items.map((item) => ({
          cartItemId: item.id,
          unitPrice: item.unitPrice,
        })),
      });
      if (next.status === "INVALID" || !next.valid || next.quotes.length === 0) {
        const issue = next.issues[0];
        const copy = commerceErrorCopy(issue?.code, issue?.message);
        setValidationIssue({ title: copy.title, message: copy.message });
        return;
      }
      if (next.status === "PRICE_CHANGED" && next.changes.length > 0) {
        pendingQuote.current = next;
        setPriceChanges(next.changes);
        setShowPriceModal(true);
        void fetchCart();
        return;
      }
      goToCheckout(next);
    } catch (cause) {
      const code = checkoutErrorCode(cause);
      if (code === "NETWORK_ERROR") {
        setShowNetworkModal(true);
      } else {
        toast.error(checkoutErrorMessage(cause, "Unable to continue to checkout"));
      }
    } finally {
      checkoutLock.current = false;
      setCheckingOut(false);
    }
  }, [fetchCart, goToCheckout, items]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  if (items.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Cart"
          description="Review products before checkout."
          breadcrumbs={[
            { label: "Marketplace", href: ROUTES.marketplace },
            { label: "Cart" },
          ]}
        />

        {activePurchaseOrder ? (
          <Card className="mb-4 border-emerald-200 bg-emerald-50/40 shadow-card">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Purchase Order {activePurchaseOrder.poNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Waiting for seller confirmation
                  </p>
                </div>
              </div>
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(
                    `${ROUTES.purchaseRequestsSuccess}?po=${activePurchaseOrder.poNumber}`,
                  )
                }
              >
                <Clock3 className="h-4 w-4" />
                View PO & Timer
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-dashed border-slate-200 shadow-card">
          <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="text-lg font-semibold text-slate-900">
                Your cart is empty
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                Browse grades on the marketplace, open a product, and tap{" "}
                <strong className="font-semibold text-slate-700">
                  Add to Cart
                </strong>{" "}
                to start a Purchase Order.
              </p>
            </div>
            <ol className="grid w-full max-w-lg gap-2 text-left sm:grid-cols-3">
              {[
                { n: "1", t: "Marketplace", d: "Pick a grade" },
                { n: "2", t: "Add to Cart", d: "Set quantity" },
                { n: "3", t: "Checkout", d: "Generate PO" },
              ].map((step) => (
                <li
                  key={step.n}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    Step {step.n}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {step.t}
                  </p>
                  <p className="text-xs text-slate-500">{step.d}</p>
                </li>
              ))}
            </ol>
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(ROUTES.marketplace)}
            >
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Cart"
        description="Review products before checkout. Supplier identity stays hidden under the PetroTrade blind marketplace model."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Cart" },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm">
        <span className="font-semibold text-slate-800">Next:</span>
        Checkout with live PetroTrade pricing → place purchase request →
        15-min seller confirmation
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-card">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-brand">
                  {item.grade.slice(0, 4).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`${ROUTES.marketplaceProduct}/${item.productId}`}
                        className="font-semibold text-slate-900 hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {item.materialType} · Grade {item.grade}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Fulfilled by PetroTrade Network · {item.regionLabel}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-brand">
                      {formatInrPerMt(item.unitPrice)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={item.quantityMt <= item.moq}
                        onClick={() =>
                          void setQuantity(item.id, item.quantityMt - 1)
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="min-w-[3rem] text-center text-sm font-semibold tabular-nums">
                        {formatQuantityMt(item.quantityMt)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={item.quantityMt >= item.availableStock}
                        onClick={() =>
                          void setQuantity(item.id, item.quantityMt + 1)
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatInr(item.unitPrice * item.quantityMt, {
                          compact: true,
                        })}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit border-slate-200 shadow-card lg:sticky lg:top-24">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cart Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Products</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Qty</span>
              <span className="font-medium tabular-nums">
                {formatQuantityMt(
                  items.reduce((sum, i) => sum + i.quantityMt, 0),
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatInr(subtotal, { compact: true })}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              GST and estimated freight are calculated at checkout.
            </p>
            <Button
              className="h-11 w-full rounded-xl bg-brand hover:bg-brand-700"
              disabled={checkingOut}
              onClick={() => void handleCheckout()}
            >
              {checkingOut ? "Checking latest pricing..." : "Proceed to Checkout"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl"
              onClick={() => router.push(ROUTES.marketplace)}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
      <PriceUpdatedDialog
        open={showPriceModal}
        changes={priceChanges}
        onReview={() => setShowPriceModal(false)}
        onContinue={
          pendingQuote.current
            ? () => {
                const next = pendingQuote.current;
                setShowPriceModal(false);
                if (next) goToCheckout(next);
              }
            : undefined
        }
      />
      <NetworkErrorDialog
        open={showNetworkModal}
        retrying={checkingOut}
        onClose={() => setShowNetworkModal(false)}
        onRetry={() => {
          setShowNetworkModal(false);
          void handleCheckout();
        }}
      />
      <CheckoutValidationDialog
        open={Boolean(validationIssue)}
        title={validationIssue?.title ?? "Unable to continue"}
        message={validationIssue?.message ?? "Please review your cart and try again."}
        confirmLabel="Review Cart"
        onConfirm={() => setValidationIssue(null)}
      />
    </PageContainer>
  );
}
