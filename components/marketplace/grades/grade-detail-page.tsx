"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, FilePlus2, Layers, PackageSearch } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { MarketplacePagination } from "@/components/marketplace/pagination";
import { ProductCard } from "@/components/marketplace/product-card";
import { OfferCard } from "@/components/marketplace/offers/offer-card";
import { ROUTES } from "@/constants";
import {
  useGradeDetail,
  useGradeOffers,
  useGradeProducts,
} from "@/hooks/use-grade-directory";
import { IMPORT_ROUTES } from "@/lib/import/config";
import {
  gradeDirectoryErrorMessage,
  isGradeNotFound,
  toGradeOffer,
} from "@/services/grade-directory";
import type { GradeDirectoryItem, PageMeta } from "@/types/grade-directory";
import { DelhiPriceListBadge, LiveOfferCount } from "./grade-badges";

interface GradeDetailPageProps {
  gradeId: string;
}

function gradeTitle(grade: GradeDirectoryItem): string {
  return grade.fullGradeName || grade.displayName || grade.name;
}

function similarGradesHref(grade: GradeDirectoryItem): string {
  const params = new URLSearchParams();
  if (grade.category?.code) params.set("category", grade.category.code);
  if (grade.gradeGroup) params.set("group", grade.gradeGroup);
  params.set("offers", "1");
  return `${ROUTES.marketplaceGrades}?${params.toString()}`;
}

function rangeOf(meta: PageMeta | undefined, count: number) {
  if (!meta || meta.total === 0) return { from: 0, to: 0 };
  const from = (meta.page - 1) * meta.limit + 1;
  return { from, to: Math.min(meta.total, from + count - 1) };
}

export function GradeDetailPage({ gradeId }: GradeDetailPageProps) {
  const [offersPage, setOffersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const gradeQuery = useGradeDetail(gradeId);
  const grade = gradeQuery.data;
  const offersQuery = useGradeOffers(gradeId, offersPage, Boolean(grade));
  const productsQuery = useGradeProducts(gradeId, productsPage, Boolean(grade));

  const productsById = useMemo(
    () => new Map((productsQuery.data?.items ?? []).map((p) => [p.id, p])),
    [productsQuery.data?.items],
  );
  const offers = useMemo(
    () =>
      grade
        ? (offersQuery.data?.items ?? []).map((offer) =>
            toGradeOffer(
              offer,
              grade,
              offer.product?.id
                ? productsById.get(offer.product.id)
                : undefined,
            ),
          )
        : [],
    [grade, offersQuery.data?.items, productsById],
  );
  const products = productsQuery.data?.items ?? [];

  const breadcrumbs = [
    { label: "Marketplace", href: ROUTES.marketplace },
    { label: "Grade Directory", href: ROUTES.marketplaceGrades },
    { label: grade ? (grade.gradeNo ?? grade.code) : "Grade" },
  ];

  if (gradeQuery.isLoading) {
    return (
      <PageContainer className="space-y-5">
        <PageHeader title="Grade details" breadcrumbs={breadcrumbs} />
        <GradeDetailSkeleton />
      </PageContainer>
    );
  }

  if (!grade) {
    const notFound = isGradeNotFound(gradeQuery.error);
    return (
      <PageContainer className="space-y-5">
        <PageHeader title="Grade details" breadcrumbs={breadcrumbs} />
        <MarketplaceEmptyState
          title={notFound ? "Grade not available" : "Unable to load grade"}
          description={
            notFound
              ? "This grade is not currently available in the directory."
              : gradeDirectoryErrorMessage(
                  gradeQuery.error,
                  "Something went wrong while loading this grade.",
                )
          }
          action={
            <>
              {!notFound ? (
                <Button
                  className="rounded-xl bg-brand hover:bg-brand-700"
                  onClick={() => void gradeQuery.refetch()}
                >
                  Retry
                </Button>
              ) : null}
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={ROUTES.marketplaceGrades}>
                  Back to Grade Directory
                </Link>
              </Button>
            </>
          }
        />
      </PageContainer>
    );
  }

  const offersMeta = offersQuery.data?.meta;
  const productsMeta = productsQuery.data?.meta;
  const offersRange = rangeOf(offersMeta, offers.length);
  const productsRange = rangeOf(productsMeta, products.length);
  const firstProduct = products[0];

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={gradeTitle(grade)}
        description={
          grade.displayName !== gradeTitle(grade)
            ? grade.displayName
            : undefined
        }
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild variant="outline" className="h-10 rounded-xl">
            <Link href={ROUTES.marketplaceGrades}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All grades
            </Link>
          </Button>
        }
      />

      <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          {grade.category ? (
            <Badge variant="secondary" className="rounded-md">
              {grade.category.displayName}
            </Badge>
          ) : null}
          {grade.gradeGroup ? (
            <Badge variant="outline" className="rounded-md">
              {grade.gradeGroup}
            </Badge>
          ) : null}
          {grade.inTodaysDelhiPriceList ? <DelhiPriceListBadge /> : null}
          <span className="ml-auto">
            <LiveOfferCount count={grade.liveOfferCount} />
          </span>
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Grade No." mono>
            {grade.gradeNo}
          </Field>
          <Field label="Grade code" mono>
            {grade.code}
          </Field>
          <Field label="Manufacturer">{grade.manufacturer}</Field>
          <Field label="Grade group">{grade.gradeGroup}</Field>
          <Field label="Category">
            {grade.category
              ? `${grade.category.displayName} (${grade.category.code})`
              : null}
          </Field>
          <Field label="Material family">
            {grade.category?.parentGroup
              ? grade.category.parentGroup
                  .toLowerCase()
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : null}
          </Field>
          <Field label="Display name">{grade.displayName}</Field>
          <Field label="Live offers">
            {grade.liveOfferCount.toLocaleString("en-IN")}
          </Field>
        </dl>

        {grade.description ? (
          <p className="text-sm leading-relaxed text-slate-600">
            {grade.description}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
        <BlindSellerBadge />
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offers">
            Live offers
            {offersMeta ? ` (${offersMeta.total.toLocaleString("en-IN")})` : ""}
          </TabsTrigger>
          <TabsTrigger value="products">
            Products
            {productsMeta
              ? ` (${productsMeta.total.toLocaleString("en-IN")})`
              : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {offersQuery.isLoading ? (
            <CardGridSkeleton />
          ) : offersQuery.isError && !offersQuery.data ? (
            <MarketplaceEmptyState
              title="Unable to load offers"
              description={gradeDirectoryErrorMessage(
                offersQuery.error,
                "Something went wrong while loading live offers.",
              )}
              action={
                <Button
                  className="rounded-xl bg-brand hover:bg-brand-700"
                  onClick={() => void offersQuery.refetch()}
                >
                  Retry
                </Button>
              }
            />
          ) : offers.length === 0 ? (
            <NoOffersState
              grade={grade}
              purchaseRequestHref={
                firstProduct
                  ? `${ROUTES.purchaseRequestsCreate}?productId=${encodeURIComponent(firstProduct.id)}`
                  : null
              }
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {offers.map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ))}
              </div>
              {offersMeta ? (
                <MarketplacePagination
                  page={offersMeta.page}
                  totalPages={offersMeta.totalPages}
                  from={offersRange.from}
                  to={offersRange.to}
                  total={offersMeta.total}
                  onPageChange={setOffersPage}
                />
              ) : null}
            </>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {productsQuery.isLoading ? (
            <CardGridSkeleton />
          ) : productsQuery.isError && !productsQuery.data ? (
            <MarketplaceEmptyState
              title="Unable to load products"
              description={gradeDirectoryErrorMessage(
                productsQuery.error,
                "Something went wrong while loading products.",
              )}
              action={
                <Button
                  className="rounded-xl bg-brand hover:bg-brand-700"
                  onClick={() => void productsQuery.refetch()}
                >
                  Retry
                </Button>
              }
            />
          ) : products.length === 0 ? (
            <MarketplaceEmptyState
              title="No products listed for this grade yet"
              description="Verified sellers have not listed this grade on the marketplace yet."
              action={
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href={similarGradesHref(grade)}>
                    Browse similar grades
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
              {productsMeta ? (
                <MarketplacePagination
                  page={productsMeta.page}
                  totalPages={productsMeta.totalPages}
                  from={productsRange.from}
                  to={productsRange.to}
                  total={productsMeta.total}
                  onPageChange={setProductsPage}
                />
              ) : null}
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function Field({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: ReactNode;
}) {
  const empty = children === null || children === undefined || children === "";
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-0.5 break-words font-mono text-sm font-semibold text-slate-800"
            : "mt-0.5 break-words text-sm font-medium text-slate-800"
        }
      >
        {empty ? "—" : children}
      </dd>
    </div>
  );
}

function NoOffersState({
  grade,
  purchaseRequestHref,
}: {
  grade: GradeDirectoryItem;
  purchaseRequestHref: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <PackageSearch className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        No live offers for this grade yet
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        Sellers have not published an active offer for this grade. Check similar
        grades or raise a request so verified suppliers can respond.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {purchaseRequestHref ? (
          <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
            <Link href={purchaseRequestHref}>
              <FilePlus2 className="h-4 w-4" aria-hidden />
              Create purchase request
            </Link>
          </Button>
        ) : (
          <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
            <Link href={IMPORT_ROUTES.create}>
              <FilePlus2 className="h-4 w-4" aria-hidden />
              Raise an import buy request
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={similarGradesHref(grade)}>
            <Layers className="h-4 w-4" aria-hidden />
            Browse similar grades
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GradeDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
      <CardGridSkeleton />
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-2xl" />
      ))}
    </div>
  );
}
