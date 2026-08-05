"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { calculateOfferSavings } from "@/lib/offer-utils";
import { getOfferById } from "@/mock/offers";
import { cn } from "@/lib/utils";

interface AppliedOfferSummaryProps {
  offerId: string;
  quantityMt: number;
  className?: string;
}

export function AppliedOfferSummary({
  offerId,
  quantityMt,
  className,
}: AppliedOfferSummaryProps) {
  const offer = getOfferById(offerId);
  if (!offer) return null;

  const { pricePerMt, savingsTotal } = calculateOfferSavings(offer, quantityMt);

  return (
    <Card className={cn("border-brand/20 bg-brand/[0.02]", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Applied Offer</CardTitle>
          <Badge className="border-0 bg-emerald-600 text-white hover:bg-emerald-600">
            OFFER APPLIED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm font-semibold text-slate-900">{offer.title}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Original Rate</dt>
            <dd className="font-medium text-slate-400 line-through">
              {formatInr(offer.priceBefore, { compact: true })} / MT
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Offer Rate</dt>
            <dd className="font-bold text-brand">
              {formatInr(pricePerMt, { compact: true })} / MT
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Quantity</dt>
            <dd className="font-medium text-slate-900">
              {formatQuantityMt(quantityMt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Offer Savings</dt>
            <dd className="font-bold text-emerald-700">
              {formatInr(savingsTotal, { compact: true })}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
