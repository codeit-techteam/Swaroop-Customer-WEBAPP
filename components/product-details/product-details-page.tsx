"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { ROUTES } from "@/constants";
import { hydrateCustomerExperienceFeed } from "@/lib/cx-feed";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import type { BulkPricingTier } from "@/types/product-details";
import { ProductHeader } from "./product-header";
import { ProductHighlights } from "./product-highlights";
import { ProductInfoCard } from "./product-info-card";
import { ProductFeatures } from "./product-features";
import { ProductApplications } from "./product-applications";
import { DeliveryCard } from "./delivery-card";
import { TechnicalSpecificationAccordion } from "./technical-specification-accordion";
import { DocumentDownloads } from "./document-downloads";
import {
  MobileBuyBar,
  StickyPurchasePanel,
} from "./sticky-purchase-panel";
import { RelatedProductsCarousel } from "./related-products-carousel";
import { ProductDetailsPageSkeleton } from "./product-details-skeleton";

interface ProductDetailsPageProps {
  productId: string;
}

function priceForQuantity(tiers: BulkPricingTier[], quantity: number) {
  const match = [...tiers].reverse().find((tier) => quantity >= tier.minMt);
  return match?.pricePerMt;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const [ready, setReady] = useState(false);
  const [quantity, setQuantity] = useState(25);
  const loadProduct = useProductStore((s) => s.loadProduct);
  const selectedProduct = useProductStore((s) => s.selectedProduct);
  const relatedProducts = useProductStore((s) => s.relatedProducts);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    async function boot() {
      await hydrateCustomerExperienceFeed();
      if (cancelled) return;
      loadProduct(productId);
      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadProduct, productId]);

  const product = selectedProduct?.id === productId ? selectedProduct : null;

  useEffect(() => {
    if (!product) return;
    setQuantity(product.moq);
  }, [product?.id, product?.moq]);

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
            title="Grade not found"
            description="This grade is unavailable or the link is invalid."
          />
        </div>
      </PageContainer>
    );
  }

  const detail = product;
  const tierPrice = priceForQuantity(detail.bulkPricing, quantity);
  const displaySpotPrice =
    tierPrice != null && tierPrice !== detail.spotPrice.pricePerMt
      ? { ...detail.spotPrice, pricePerMt: tierPrice }
      : detail.spotPrice;

  function handleSelectTier(tier: BulkPricingTier) {
    const next = Math.min(detail.stock, Math.max(detail.moq, tier.minMt));
    setQuantity(next);
  }

  function handleMobileAdd() {
    const result = addItem(detail.id, quantity, detail.packaging);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  }

  return (
    <PageContainer className="space-y-6 pb-24 lg:pb-8">
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-brand">
              {detail.grade.slice(0, 4).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
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
          <DocumentDownloads documents={detail.documents} />
        </div>

        <div>
          <StickyPurchasePanel
            productId={detail.id}
            spotPrice={displaySpotPrice}
            bulkPricing={detail.bulkPricing}
            paymentOptions={detail.paymentOptions}
            moq={detail.moq}
            maxStock={detail.stock}
            packaging={detail.packaging}
            availabilityLabel={detail.availabilityLabel}
            eta={detail.eta}
            freightPerMt={detail.logistics.freightPerMt}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onSelectTier={handleSelectTier}
          />
        </div>
      </motion.div>

      <RelatedProductsCarousel products={relatedProducts} />

      <MobileBuyBar
        pricePerMt={displaySpotPrice.pricePerMt}
        quantity={quantity}
        onAddToCart={handleMobileAdd}
      />
    </PageContainer>
  );
}
