"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FilePlus2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { getOfferStatus, getStatusLabel } from "@/lib/offer-utils";
import {
  getOfferById,
  getOfferDetailHref,
  getOfferQuoteHref,
} from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import type { MyOfferTab } from "@/types/offers";

const TABS: { id: MyOfferTab; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "applied", label: "Applied" },
  { id: "used", label: "Used" },
  { id: "expired", label: "Expired" },
];

export function MyOffersPage() {
  const [tab, setTab] = useState<MyOfferTab>("available");
  const getMyOffers = useOffersStore((s) => s.getMyOffers);

  const records = useMemo(() => getMyOffers(tab), [getMyOffers, tab]);

  return (
    <PageContainer className="max-w-[1200px]">
      <PageHeader
        title="My Offers"
        description="Track offers you've saved, applied, used or that have expired."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "My Offers" },
        ]}
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={ROUTES.marketplace}>Back to Marketplace</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as MyOfferTab)}>
        <TabsList className="mb-6 h-auto flex-wrap rounded-xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-lg data-[state=active]:bg-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {records.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-sm text-slate-500">
                  No {t.label.toLowerCase()} offers yet.
                </p>
                <Button
                  asChild
                  className="mt-4 rounded-xl bg-brand hover:bg-brand-700"
                >
                  <Link href={ROUTES.marketplace}>Browse Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const offer = getOfferById(record.offerId);
                      if (!offer) return null;
                      const liveStatus = getOfferStatus(offer);
                      return (
                        <TableRow key={record.offerId}>
                          <TableCell className="font-medium">
                            {offer.badge}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-slate-900">
                              {offer.productName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {"Verified Supply Partner"}
                            </p>
                          </TableCell>
                          <TableCell className="tabular-nums text-emerald-700">
                            {formatInr(offer.savings, { compact: true })} / MT
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {getStatusLabel(
                                record.status === "expired"
                                  ? "expired"
                                  : liveStatus,
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formatDateDdMmYyyy(offer.expiresAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                              >
                                <Link href={getOfferDetailHref(offer.id)}>
                                  View
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                              {liveStatus === "active" ||
                              liveStatus === "ending_soon" ? (
                                <Button
                                  asChild
                                  size="sm"
                                  className="rounded-lg bg-brand hover:bg-brand-700"
                                >
                                  <Link href={getOfferQuoteHref(offer)}>
                                    <FilePlus2 className="h-3.5 w-3.5" />
                                    Request
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}
