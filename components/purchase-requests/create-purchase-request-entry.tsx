"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useCartStore } from "@/store/cartStore";

type Props = {
  productId?: string;
};

/**
 * Guided entry for CREATE PURCHASE REQUEST (Home CMS secondary CTA).
 * Reuses cart → checkout → POST /customer/purchase-requests — never a bare
 * marketplace / grade-list dump (B-02).
 */
export function CreatePurchaseRequestEntry({ productId }: Props) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useCartStore.persist.onFinishHydration(finish);
    if (useCartStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void fetchCart();
  }, [fetchCart, hydrated]);

  useEffect(() => {
    if (!productId) return;
    router.replace(`${ROUTES.marketplaceProduct}/${productId}`);
  }, [productId, router]);

  if (productId) {
    return (
      <PageContainer>
        <PageHeader
          title="Create Purchase Request"
          description="Opening product details…"
        />
      </PageContainer>
    );
  }

  const cartCount = items.length;

  return (
    <PageContainer>
      <PageHeader
        title="Create Purchase Request"
        description="Choose a marketplace grade, set quantity and delivery, then verify pricing and place your request."
      />

      <div className="mx-auto mt-8 grid max-w-2xl gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            How it works
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Select an in-stock marketplace grade</li>
            <li>Confirm quantity (MOQ), delivery address and payment terms</li>
            <li>
              Review backend pricing and tap{" "}
              <span className="font-medium text-slate-800">
                Verify &amp; Place Purchase Request
              </span>
            </li>
          </ol>
        </div>

        {cartCount > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Continue with your cart
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You have {cartCount} item{cartCount === 1 ? "" : "s"} ready for
              checkout. Review quantity and address, then place the purchase
              request.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.cart}>Review cart &amp; checkout</Link>
            </Button>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {cartCount > 0 ? "Add another grade" : "Select a grade"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Open the marketplace to pick a product. From product details you can
            add to cart and continue to checkout — the same flow used across
            Customer Web and the mobile app.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`${ROUTES.marketplace}?intent=purchase-request`}>
              Browse marketplace grades
            </Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
