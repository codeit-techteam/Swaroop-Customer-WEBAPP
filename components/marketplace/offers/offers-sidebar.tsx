"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Clock3, Flame, TrendingUp } from "lucide-react";
import { formatInr } from "@/lib/format";
import { getOfferById, getOfferDetailHref } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import { cn } from "@/lib/utils";

interface OffersRightSidebarProps {
  className?: string;
}

export function OffersRightSidebar({ className }: OffersRightSidebarProps) {
  const offers = useOffersStore((s) => s.offers);
  const recentlyViewedIds = useOffersStore((s) => s.recentlyViewedIds);

  const trending = offers.filter((o) => o.isTrending).slice(0, 4);
  const mostRequested = [...offers]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 4);
  const recentlyViewed = recentlyViewedIds
    .map((id) => getOfferById(id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <aside className={cn("space-y-4", className)}>
      <SidebarCard
        title="Trending Offers"
        icon={<Flame className="h-4 w-4 text-amber-500" />}
      >
        {trending.map((offer) => (
          <SidebarOfferRow
            key={offer.id}
            href={getOfferDetailHref(offer.id)}
            title={offer.productName}
            meta={`${offer.discountPercent}% off · Verified Partner`}
            price={offer.offerPrice}
          />
        ))}
      </SidebarCard>

      <SidebarCard
        title="Most Requested"
        icon={<TrendingUp className="h-4 w-4 text-brand" />}
      >
        {mostRequested.map((offer) => (
          <SidebarOfferRow
            key={offer.id}
            href={getOfferDetailHref(offer.id)}
            title={offer.productName}
            meta={`${offer.requestCount} requests`}
            price={offer.offerPrice}
          />
        ))}
      </SidebarCard>

      <SidebarCard
        title="Recently Viewed"
        icon={<Clock3 className="h-4 w-4 text-slate-500" />}
      >
        {recentlyViewed.length ? (
          recentlyViewed.map((offer) =>
            offer ? (
              <SidebarOfferRow
                key={offer.id}
                href={getOfferDetailHref(offer.id)}
                title={offer.productName}
                meta="Western India Region"
                price={offer.offerPrice}
              />
            ) : null,
          )
        ) : (
          <p className="px-1 py-2 text-xs text-slate-400">
            View an offer to populate this list.
          </p>
        )}
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SidebarOfferRow({
  href,
  title,
  meta,
  price,
}: {
  href: string;
  title: string;
  meta: string;
  price: number;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-1 py-1.5 transition-colors hover:bg-slate-50"
    >
      <p className="truncate text-sm font-medium text-slate-800">{title}</p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-slate-500">{meta}</p>
        <p className="shrink-0 text-xs font-semibold tabular-nums text-brand">
          {formatInr(price)}
        </p>
      </div>
    </Link>
  );
}
