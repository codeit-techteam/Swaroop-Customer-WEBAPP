"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { ROUTES } from "@/constants";
import { useCustomerQuote } from "@/hooks/use-customer-quote";
import { useAuthStore } from "@/store/authStore";
import { useDeliveryLocationStore } from "@/store/deliveryLocationStore";
import type { CreditCtaType } from "@/types/payment-eligibility";
import { guestCreditAccess } from "@/types/payment-eligibility";
import { formatInr } from "@/lib/format";
import { useProductStore } from "@/store/productStore";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import type { BulkPricingTier, PaymentMethodId } from "@/types/product-details";
import { ProductHeader } from "./product-header";
import { ProductHighlights } from "./product-highlights";
import { ProductInfoCard } from "./product-info-card";
import { ProductFeatures } from "./product-features";
import { ProductApplications } from "./product-applications";
import { DeliveryCard } from "./delivery-card";
import { TechnicalSpecificationAccordion } from "./technical-specification-accordion";
import { DocumentDownloads } from "./document-downloads";
import { MobileBuyBar, StickyPurchasePanel } from "./sticky-purchase-panel";
import { TrustBadges } from "./trust-badges";
import { RelatedProductsCarousel } from "./related-products-carousel";
import { ProductDetailsPageSkeleton } from "./product-details-skeleton";
import { usePurchaseActions } from "./use-purchase-actions";

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const destinationPincode = useDeliveryLocationStore(
    (s) => s.selected?.pincode ?? null,
  );
  const [quantity, setQuantity] = useState(25);
  const [paymentId, setPaymentId] = useState<PaymentMethodId>("advance");
  const [rfqNotes, setRfqNotes] = useState("");
  const [rfqDestination, setRfqDestination] = useState("");
  const loadProduct = useProductStore((s) => s.loadProduct);
  const selectedProduct = useProductStore((s) => s.selectedProduct);
  const relatedProducts = useProductStore((s) => s.relatedProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const loadError = useProductStore((s) => s.loadError);
  const [actionsEl, setActionsEl] = useState<HTMLDivElement | null>(null);
  const [actionsInView, setActionsInView] = useState(false);

  useEffect(() => {
    if (!actionsEl) {
      setActionsInView(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setActionsInView(entry?.isIntersecting ?? false),
    );
    observer.observe(actionsEl);
    return () => observer.disconnect();
  }, [actionsEl]);

  const {
    quote,
    paymentOptions,
    creditAccess,
    creditStatus,
    refreshCredit,
    loading: quoteLoading,
    error: quoteError,
  } = useCustomerQuote({
    productId,
    offerId: selectedProduct?.offerId,
    quantity,
    paymentId,
    enabled: Boolean(selectedProduct) && isAuthenticated,
    amount: selectedProduct
      ? selectedProduct.spotPrice.pricePerMt * quantity
      : undefined,
  });

  const actions = usePurchaseActions({
    productId: selectedProduct?.id ?? productId,
    offerId: selectedProduct?.offerId,
    packaging: selectedProduct?.packaging ?? "",
    quantity,
    maxStock: selectedProduct?.stock ?? 0,
    paymentId,
    quote,
    quoteLoading,
    quoteError,
  });

  useEffect(() => {
    void loadProduct(productId);
  }, [loadProduct, productId]);

  useEffect(() => {
    const options =
      paymentOptions.length > 0
        ? paymentOptions
        : (selectedProduct?.paymentOptions ?? []);
    const current = options.find((option) => option.id === paymentId);
    if (current && current.eligible) return;
    const next = options.find((option) => option.eligible);
    if (next && next.id !== paymentId) setPaymentId(next.id);
  }, [paymentId, paymentOptions, selectedProduct?.paymentOptions]);

  const product = selectedProduct;
  const ready = !isLoading;

  useEffect(() => {
    if (!product) return;
    const stock = product.stock;
    if (stock <= 0) {
      setQuantity(0);
      return;
    }

    const qtyParam = searchParams.get("qty");
    const parsedQty = qtyParam ? Number(qtyParam) : NaN;
    if (Number.isFinite(parsedQty) && parsedQty > 0) {
      setQuantity(
        Math.min(stock, Math.max(Math.min(product.moq, stock), parsedQty)),
      );
    } else {
      setQuantity(Math.min(product.moq, stock));
    }

    const notes = searchParams.get("notes");
    const destination = searchParams.get("destination");
    if (notes) setRfqNotes(notes);
    if (destination) setRfqDestination(destination);
  }, [product?.id, product?.moq, product?.stock, searchParams]);

  if (!ready) {
    return (
      <PageContainer>
        <ProductDetailsPageSkeleton />
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <AppBreadcrumb
          items={[
            { label: "Marketplace", href: ROUTES.marketplace },
            { label: "Grade" },
          ]}
        />
        <div className="mt-6">
          <MarketplaceEmptyState
            title={loadError ? "Unable to load product" : "Grade not found"}
            description={
              loadError ?? "This grade is unavailable or the link is invalid."
            }
          />
        </div>
      </PageContainer>
    );
  }

  const detail = product;
  const displaySpotPrice = quote
    ? { ...detail.spotPrice, pricePerMt: Number(quote.unitPrice) }
    : detail.spotPrice;

  function handleCreditCta(type: CreditCtaType) {
    if (!isAuthenticated) {
      router.push(
        `${ROUTES.login}?returnTo=${encodeURIComponent(ROUTES.paymentsRequestCredit)}`,
      );
      return;
    }
    if (type === "VIEW_APPLICATION" && creditAccess?.application?.id) {
      router.push(
        `${ROUTES.paymentsRequestCredit}?id=${encodeURIComponent(creditAccess.application.id)}`,
      );
      return;
    }
    if (type === "CONTACT_SUPPORT") {
      router.push(ROUTES.support);
      return;
    }
    router.push(ROUTES.paymentsRequestCredit);
  }

  function handleSelectTier(tier: BulkPricingTier) {
    if (detail.stock <= 0) {
      setQuantity(0);
      return;
    }
    const next = Math.min(
      detail.stock,
      Math.max(Math.min(detail.moq, detail.stock), tier.minMt),
    );
    setQuantity(Math.min(next, detail.stock));
  }

  return (
    // overflow-x-clip (not hidden) so the purchase panel can stay position: sticky
    <PageContainer className="space-y-6 overflow-x-clip pb-28 xl:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="min-w-0 space-y-6 xl:col-start-1 xl:row-start-1">
          <AppBreadcrumb
            items={[
              { label: "Marketplace", href: ROUTES.marketplace },
              {
                label: detail.categoryName,
                href: `${ROUTES.marketplaceCategory}/${detail.categorySlug}`,
              },
              { label: detail.name },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-brand">
              {detail.grade.slice(0, 4).toUpperCase()}
            </div>
            <div className="min-w-[12rem] flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Blind Marketplace Offer
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Commercial and technical data only — no product photography and
                no seller identity during discovery.
              </p>
            </div>
            <BlindSellerBadge />
          </div>

          <ProductHeader product={detail} />
          <ProductHighlights highlights={detail.highlights} />
          {searchParams.get("rfq") === "1" && (rfqNotes || rfqDestination) ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Purchase request details
              </p>
              {rfqDestination ? (
                <p className="mt-2">
                  <span className="font-medium text-slate-900">
                    Destination:
                  </span>{" "}
                  {rfqDestination}
                </p>
              ) : null}
              {rfqNotes ? (
                <p className="mt-1">
                  <span className="font-medium text-slate-900">Notes:</span>{" "}
                  {rfqNotes}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <StickyPurchasePanel
            spotPrice={displaySpotPrice}
            bulkPricing={detail.bulkPricing}
            paymentOptions={
              paymentOptions.length > 0
                ? paymentOptions
                : detail.paymentOptions.filter((option) => option.title?.trim())
            }
            paymentId={paymentId}
            onPaymentChange={setPaymentId}
            creditAccess={
              isAuthenticated
                ? creditAccess
                : guestCreditAccess(detail.productCredit)
            }
            creditStatus={isAuthenticated ? creditStatus : ("ready" as const)}
            onRetryCredit={isAuthenticated ? refreshCredit : undefined}
            onCreditCta={handleCreditCta}
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
            offerId={detail.offerId}
            gradeId={detail.gradeId}
            productId={detail.id}
            moq={detail.moq}
            maxStock={detail.stock}
            availabilityLabel={detail.availabilityLabel}
            fulfilment={detail.fulfilment}
            destinationPincode={destinationPincode}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onSelectTier={handleSelectTier}
            actions={actions}
            actionsRef={setActionsEl}
          />
        </div>

        <div className="min-w-0 space-y-6 xl:col-start-1 xl:row-start-2">
          <ProductInfoCard product={detail} />
          <DeliveryCard
            fulfilment={detail.fulfilment}
            availabilityLabel={detail.availabilityLabel}
            destinationPincode={destinationPincode}
          />
          <TrustBadges />
          <ProductFeatures features={detail.features} />
          <ProductApplications
            applications={detail.applications}
            industry={detail.industry}
          />
          <TechnicalSpecificationAccordion specs={detail.specs} />
          <DocumentDownloads
            documents={detail.documents}
            productId={detail.id}
          />
        </div>
      </motion.div>

      <RelatedProductsCarousel products={relatedProducts} />

      <MobileBuyBar
        visible={!actionsInView}
        quantity={quantity}
        totalLabel={
          quote
            ? formatInr(Number(quote.totalAmount), { compact: true })
            : quoteLoading
              ? "Calculating…"
              : "—"
        }
        actions={actions}
      />
    </PageContainer>
  );
}
