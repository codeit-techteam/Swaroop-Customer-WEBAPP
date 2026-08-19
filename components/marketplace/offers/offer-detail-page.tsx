"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  MapPin,
  Share2,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants";
import { formatQuantityMt } from "@/lib/format";
import { getOfferDetailHref } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import { OfferCountdownBlocks } from "./offer-countdown";
import { PaymentTypeBadges } from "./payment-type-badges";
import { OfferCard } from "./offer-card";
import { SavingsCalculator } from "./savings-calculator";
import { VolumePricing } from "./volume-pricing";
import { OfferBadge } from "./offer-badge";
import { isOfferPurchasable } from "@/lib/offer-utils";
import { cn } from "@/lib/utils";

interface OfferDetailPageProps {
  offerId: string;
}

export function OfferDetailPage({ offerId }: OfferDetailPageProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const [quantityMt, setQuantityMt] = useState<number | null>(null);
  const getOffer = useOffersStore((s) => s.getOffer);
  const offers = useOffersStore((s) => s.offers);
  const markViewed = useOffersStore((s) => s.markViewed);

  const offer = getOffer(offerId);

  useEffect(() => {
    if (offer) {
      markViewed(offer.id);
      setQuantityMt(offer.moq);
    }
  }, [offer, markViewed]);

  const related = useMemo(() => {
    if (!offer) return [];
    return offers
      .filter(
        (item) =>
          item.id !== offer.id &&
          (item.categoryId === offer.categoryId ||
            item.brandId === offer.brandId),
      )
      .slice(0, 3);
  }, [offer, offers]);

  if (!offer) {
    return (
      <PageContainer>
        <PageHeader
          title="Offer not found"
          description="This marketplace offer may have expired or been removed."
          breadcrumbs={[
            { label: "Marketplace", href: ROUTES.marketplace },
            { label: "Details" },
          ]}
        />
        <Button
          className="rounded-xl bg-brand hover:bg-brand-700"
          onClick={() => router.push(ROUTES.marketplace)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>
      </PageContainer>
    );
  }

  const purchasable = isOfferPurchasable(offer);
  const resolvedQty = quantityMt ?? offer.moq;

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : getOfferDetailHref(offer.id);
    try {
      if (navigator.share) {
        await navigator.share({
          title: offer.title,
          text: offer.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Offer link copied");
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Offer link copied");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={offer.title}
        description={offer.productName}
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: offer.badge },
        ]}
        actions={
          <Button asChild variant="outline" className="h-10 rounded-xl">
            <Link href={ROUTES.marketplace}>
              <ArrowLeft className="h-4 w-4" />
              Marketplace
            </Link>
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-elevated">
          <div className="relative min-h-[240px] md:min-h-[300px]">
            <Image
              src={offer.bannerImage}
              alt={offer.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand/90 via-brand/70 to-brand/30" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6 md:p-8">
              <div className="max-w-2xl space-y-3">
                <Badge className="border-0 bg-accent-blue text-white hover:bg-accent-blue">
                  {offer.badge}
                </Badge>
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {offer.title}
                </h2>
                <p className="text-sm text-white/80 md:text-base">
                  {offer.description}
                </p>
              </div>
              <OfferCountdownBlocks expiresAt={offer.expiresAt} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-40 sm:w-40">
                  {!imageFailed ? (
                    <Image
                      src={offer.productImage}
                      alt={offer.productName}
                      fill
                      className="object-cover"
                      sizes="160px"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-brand">
                      {offer.grade}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Verified Partner
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {offer.categoryLabel}
                    </span>
                    <Badge variant="success">−{offer.discountPercent}%</Badge>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {offer.productName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Grade {offer.grade} · Fulfilled by PetroTrade Supply Network
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Western India Region
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Warehouse className="h-4 w-4 text-slate-400" />
                      {offer.availableQuantity} MT available
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Offer Description
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {offer.description}
                </p>
              </div>

              <div className="mt-5">
                <h4 className="text-sm font-semibold text-slate-900">
                  Terms & Conditions
                </h4>
                <ul className="mt-2 space-y-2">
                  {offer.termsAndConditions.map((term) => (
                    <li
                      key={term}
                      className="flex gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {offer.bulkTiers?.length ? (
              <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6">
                <VolumePricing offer={offer} quantityMt={resolvedQty} />
              </section>
            ) : null}

            {related.length ? (
              <section>
                <h4 className="mb-4 text-lg font-semibold text-slate-900">
                  Related Offers
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {related.map((item, index) => (
                    <OfferCard key={item.id} offer={item} index={index} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SavingsCalculator
              offer={offer}
              quantityMt={resolvedQty}
              onQuantityChange={setQuantityMt}
            />

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Offer Details
                </p>
                <OfferBadge offer={offer} variant="status" />
              </div>
              <div className="space-y-2 text-sm">
                <PriceRow
                  label="Discount"
                  value={`${offer.discountPercent}%`}
                />
                <PriceRow
                  label="Stock"
                  value={formatQuantityMt(offer.remainingStock)}
                />
                <PriceRow label="Region" value="Western India Region" />
                <PriceRow
                  label="Delivery Estimate"
                  value="After seller approval"
                />
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Payment Eligibility
                </p>
                <PaymentTypeBadges types={offer.paymentTypes} size="md" />
              </div>

              <div className="mt-4 grid gap-2">
                <Button
                  asChild
                  className="h-11 rounded-xl bg-brand font-semibold hover:bg-brand-700"
                  disabled={!purchasable}
                >
                  <Link
                    href={
                      purchasable
                        ? `${ROUTES.marketplaceProduct}/${offer.productId}`
                        : "#"
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={() =>
                      toast.success("Brochure download started (demo)")
                    }
                  >
                    <Download className="h-4 w-4" />
                    Brochure
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </PageContainer>
  );
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3", strong && "pt-1")}
    >
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{value}</span>
    </div>
  );
}
