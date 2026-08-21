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
import type { BulkPricingTier } from "@/types/product-details";
import { ProductGallery } from "./product-gallery";
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
  const galleryIndex = useProductStore((s) => s.galleryIndex);
  const setGalleryIndex = useProductStore((s) => s.setGalleryIndex);
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
            { label: "Product" },
          ]}
        />
        <div className="mt-6">
          <MarketplaceEmptyState
            title="Product not found"
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
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,0.3fr)_minmax(0,0.45fr)_minmax(260px,0.25fr)]"
      >
        <div className="space-y-6 lg:col-start-1 lg:row-start-1 xl:col-start-1">
          <ProductGallery
            images={detail.gallery}
            activeIndex={galleryIndex}
            onSelect={setGalleryIndex}
          />
          <div className="hidden space-y-6 xl:block">
            <ProductFeatures features={detail.features} />
            <ProductApplications
              applications={detail.applications}
              industry={detail.industry}
            />
          </div>
        </div>

        <div className="space-y-6 lg:col-start-1 lg:row-start-2 xl:col-start-2 xl:row-start-1">
          <ProductHeader product={detail} />
          <ProductHighlights highlights={detail.highlights} />
          <ProductInfoCard product={detail} />
          <DeliveryCard
            origin={detail.origin}
            eta={detail.eta}
            logistics={detail.logistics}
          />
          <div className="space-y-6 xl:hidden">
            <ProductFeatures features={detail.features} />
            <ProductApplications
              applications={detail.applications}
              industry={detail.industry}
            />
          </div>
          <TechnicalSpecificationAccordion specs={detail.specs} />
          <DocumentDownloads documents={detail.documents} />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3 xl:row-span-1">
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
