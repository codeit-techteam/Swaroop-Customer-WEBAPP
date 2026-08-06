"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { ROUTES } from "@/constants";
import { useProductStore } from "@/store/productStore";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { ProductGallery } from "./product-gallery";
import { QualityCard } from "./quality-card";
import { ProductHeader } from "./product-header";
import { ProductInfoCard } from "./product-info-card";
import { TechnicalSpecificationAccordion } from "./technical-specification-accordion";
import { ComplianceAccordion } from "./compliance-accordion";
import { SpotPriceCard } from "./spot-price-card";
import { BulkPricingCard } from "./bulk-pricing-card";
import { PaymentOptionsCard } from "./payment-options-card";
import { LogisticsCard } from "./logistics-card";
import { AddToCartPanel } from "./add-to-cart-panel";
import { DownloadSpecButton } from "./download-spec-button";
import { RelatedProductsCarousel } from "./related-products-carousel";
import { ProductDetailsPageSkeleton } from "./product-details-skeleton";

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const [ready, setReady] = useState(false);
  const loadProduct = useProductStore((s) => s.loadProduct);
  const selectedProduct = useProductStore((s) => s.selectedProduct);
  const galleryIndex = useProductStore((s) => s.galleryIndex);
  const setGalleryIndex = useProductStore((s) => s.setGalleryIndex);
  const relatedProducts = useProductStore((s) => s.relatedProducts);

  useEffect(() => {
    setReady(false);
    loadProduct(productId);
    const timer = window.setTimeout(() => setReady(true), 320);
    return () => window.clearTimeout(timer);
  }, [loadProduct, productId]);

  const product = selectedProduct?.id === productId ? selectedProduct : null;

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

  return (
    <PageContainer className="space-y-8">
      <AppBreadcrumb
        items={[
          { label: "Marketplace", href: ROUTES.marketplace },
          {
            label: product.categoryName,
            href: `${ROUTES.marketplaceCategory}/${product.categorySlug}`,
          },
          { label: product.name },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_300px]"
      >
        <div className="space-y-3">
          <ProductGallery
            images={product.gallery}
            activeIndex={galleryIndex}
            onSelect={setGalleryIndex}
          />
          <QualityCard quality={product.quality} />
        </div>

        <div className="space-y-4">
          <ProductHeader product={product} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Fulfilled by
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              PetroTrade Network
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Verified Supply Partner",
                "Quality Assured",
                "GST Compliant",
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <ProductInfoCard product={product} />
          <TechnicalSpecificationAccordion specs={product.specs} />
          <ComplianceAccordion documents={product.documents} />
        </div>

        <aside className="space-y-3 xl:sticky xl:top-24">
          <SpotPriceCard spotPrice={product.spotPrice} />
          <BulkPricingCard tiers={product.bulkPricing} />
          <PaymentOptionsCard options={product.paymentOptions} />
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
            <AddToCartPanel
              productId={product.id}
              moq={product.moq}
              maxStock={product.stock}
              packaging={product.packaging}
            />
            <DownloadSpecButton productName={product.name} />
            <p className="px-1 text-[11px] leading-relaxed text-slate-400">
              {product.spotPrice.note}
            </p>
          </div>
          <LogisticsCard logistics={product.logistics} />
        </aside>
      </motion.div>

      <RelatedProductsCarousel products={relatedProducts} />
    </PageContainer>
  );
}
