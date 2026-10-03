"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { ROUTES } from "@/constants";
import { useCustomerQuote } from "@/hooks/use-customer-quote";
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
import { RelatedProductsCarousel } from "./related-products-carousel";
import { ProductDetailsPageSkeleton } from "./product-details-skeleton";
import { usePurchaseActions } from "./use-purchase-actions";

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const [quantity, setQuantity] = useState(25);
  const [paymentId, setPaymentId] = useState<PaymentMethodId>("advance");
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
    loading: quoteLoading,
    error: quoteError,
  } = useCustomerQuote({
    productId,
    offerId: selectedProduct?.offerId,
    quantity,
    paymentId,
    enabled: Boolean(selectedProduct),
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

  const product = selectedProduct;
  const ready = !isLoading;

  useEffect(() => {
    if (!product) return;
    const stock = product.stock;
    if (stock <= 0) {
      setQuantity(0);
      return;
    }
    setQuantity(Math.min(product.moq, stock));
  }, [product?.id, product?.moq, product?.stock]);

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
        </div>

        <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <StickyPurchasePanel
            spotPrice={displaySpotPrice}
            bulkPricing={detail.bulkPricing}
            paymentOptions={paymentOptions}
            paymentId={paymentId}
            onPaymentChange={setPaymentId}
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
            moq={detail.moq}
            maxStock={detail.stock}
            availabilityLabel={detail.availabilityLabel}
            eta={detail.eta}
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
            origin={detail.origin}
            eta={detail.eta}
            logistics={detail.logistics}
          />
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
