"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search, Store, X } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { MarketplacePagination } from "@/components/marketplace/pagination";
import { ROUTES, marketplaceGradePath } from "@/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { useGradeDirectory, useGradeFacets } from "@/hooks/use-grade-directory";
import { gradeDirectoryErrorMessage } from "@/services/grade-directory";
import { cn } from "@/lib/utils";
import type { GradeDirectoryItem } from "@/types/grade-directory";
import { FacetCombobox } from "./facet-combobox";
import { DelhiPriceListBadge, LiveOfferCount } from "./grade-badges";

const PAGE_SIZE = 24;
const TOP_CATEGORY_CHIPS = 8;

type FilterKey =
  "q" | "category" | "group" | "manufacturer" | "offers" | "page";

function readFilters(params: URLSearchParams) {
  const page = Number(params.get("page"));
  return {
    q: params.get("q") ?? "",
    category: params.get("category") || null,
    group: params.get("group") || null,
    manufacturer: params.get("manufacturer") || null,
    offers: params.get("offers") === "1",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function GradeDirectoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const latestParams = useRef(searchParams);
  latestParams.current = searchParams;

  const updateParams = useCallback(
    (
      patch: Partial<Record<FilterKey, string | null>>,
      mode: "push" | "replace" = "push",
    ) => {
      const next = new URLSearchParams(latestParams.current.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (!("page" in patch)) next.delete("page");
      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (mode === "replace") router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [pathname, router],
  );

  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const current = latestParams.current.get("q") ?? "";
    if (debouncedSearch.trim() === current.trim()) return;
    updateParams({ q: debouncedSearch.trim() || null }, "replace");
  }, [debouncedSearch, updateParams]);

  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [manufacturerOpen, setManufacturerOpen] = useState(false);
  const debouncedManufacturerSearch = useDebounce(manufacturerSearch, 250);

  const facets = useGradeFacets({ category: filters.category ?? undefined });
  const manufacturerFacets = useGradeFacets(
    {
      category: filters.category ?? undefined,
      search: debouncedManufacturerSearch || undefined,
    },
    manufacturerOpen && Boolean(debouncedManufacturerSearch),
  );

  const directory = useGradeDirectory({
    page: filters.page,
    limit: PAGE_SIZE,
    search: filters.q || undefined,
    category: filters.category ?? undefined,
    gradeGroup: filters.group ?? undefined,
    manufacturer: filters.manufacturer ?? undefined,
    hasOffers: filters.offers || undefined,
  });

  const categories = useMemo(
    () => facets.data?.categories ?? [],
    [facets.data?.categories],
  );
  const topCategories = useMemo(
    () =>
      [...categories]
        .sort((a, b) => b.gradeCount - a.gradeCount)
        .slice(0, TOP_CATEGORY_CHIPS),
    [categories],
  );
  const selectedCategory = categories.find(
    (c) => c.code.toUpperCase() === filters.category?.toUpperCase(),
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.code,
        label: c.displayName || c.name,
        count: c.gradeCount,
      })),
    [categories],
  );
  const gradeGroupOptions = useMemo(
    () =>
      (facets.data?.gradeGroups ?? []).map((g) => ({
        value: g.name,
        label: g.name,
        count: g.gradeCount,
      })),
    [facets.data?.gradeGroups],
  );
  const manufacturerNeedle = manufacturerSearch.trim().toLowerCase();
  const manufacturerSource =
    debouncedManufacturerSearch &&
    manufacturerFacets.data &&
    !manufacturerFacets.isPlaceholderData
      ? manufacturerFacets.data.manufacturers
      : (facets.data?.manufacturers ?? []).filter((m) =>
          manufacturerNeedle
            ? m.name.toLowerCase().includes(manufacturerNeedle)
            : true,
        );
  const manufacturerOptions = manufacturerSource.map((m) => ({
    value: m.name,
    label: m.name,
    count: m.gradeCount,
  }));

  const hasActiveFilters = Boolean(
    filters.q ||
    filters.category ||
    filters.group ||
    filters.manufacturer ||
    filters.offers,
  );

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname, { scroll: false });
  };

  const lastPage = directory.isPlaceholderData
    ? null
    : directory.data?.meta.totalPages;
  useEffect(() => {
    if (lastPage && filters.page > lastPage) {
      updateParams({ page: lastPage > 1 ? String(lastPage) : null }, "replace");
    }
  }, [lastPage, filters.page, updateParams]);

  const meta = directory.data?.meta;
  const items = directory.data?.items ?? [];
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const page = Math.min(filters.page, totalPages);
  const from = total === 0 ? 0 : (page - 1) * (meta?.limit ?? PAGE_SIZE) + 1;
  const to = Math.min(total, from + items.length - 1);

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Grade Directory"
        description="Browse the PetroTrade Grade Master by category, grade group and manufacturer, then open a grade to see live blind offers."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Grade Directory" },
        ]}
        actions={
          <Button asChild variant="outline" className="h-10 rounded-xl">
            <Link href={ROUTES.marketplace}>
              <Store className="h-4 w-4" aria-hidden />
              Live listings
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
        <BlindSellerBadge />
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search Grade No., grade name, manufacturer, grade group or category…"
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm"
            aria-label="Search grades"
            autoComplete="off"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {topCategories.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip
              active={!filters.category}
              onClick={() => updateParams({ category: null, group: null })}
            >
              All categories
            </CategoryChip>
            {topCategories.map((category) => (
              <CategoryChip
                key={category.id}
                active={selectedCategory?.id === category.id}
                onClick={() =>
                  updateParams({ category: category.code, group: null })
                }
              >
                {category.displayName || category.name}
                <span className="ml-1.5 text-[11px] tabular-nums opacity-70">
                  {category.gradeCount.toLocaleString("en-IN")}
                </span>
              </CategoryChip>
            ))}
          </div>
        ) : facets.isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-lg" />
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label
              htmlFor="grade-filter-category"
              className="text-xs text-slate-500"
            >
              Category
            </Label>
            <FacetCombobox
              id="grade-filter-category"
              value={
                selectedCategory
                  ? selectedCategory.displayName || selectedCategory.name
                  : filters.category
              }
              options={categoryOptions}
              onChange={(code) => updateParams({ category: code, group: null })}
              placeholder="All categories"
              allLabel="All categories"
              searchPlaceholder="Search categories…"
              loading={facets.isLoading}
              error={facets.isError}
              onRetry={() => void facets.refetch()}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="grade-filter-group"
              className="text-xs text-slate-500"
            >
              Grade group
            </Label>
            <FacetCombobox
              id="grade-filter-group"
              value={filters.group}
              options={gradeGroupOptions}
              onChange={(group) => updateParams({ group })}
              placeholder="All grade groups"
              allLabel="All grade groups"
              searchPlaceholder="Search grade groups…"
              loading={
                facets.isFetching &&
                (facets.isPlaceholderData || !gradeGroupOptions.length)
              }
              error={facets.isError}
              onRetry={() => void facets.refetch()}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="grade-filter-manufacturer"
              className="text-xs text-slate-500"
            >
              Manufacturer
            </Label>
            <FacetCombobox
              id="grade-filter-manufacturer"
              value={filters.manufacturer}
              options={manufacturerOptions}
              onChange={(manufacturer) => updateParams({ manufacturer })}
              placeholder="All manufacturers"
              allLabel="All manufacturers"
              searchPlaceholder="Search manufacturers…"
              onSearchChange={setManufacturerSearch}
              onOpenChange={setManufacturerOpen}
              loading={
                manufacturerFacets.isFetching ||
                (facets.isLoading && !manufacturerOptions.length)
              }
              error={manufacturerFacets.isError || facets.isError}
              onRetry={() => {
                void facets.refetch();
                if (debouncedManufacturerSearch)
                  void manufacturerFacets.refetch();
              }}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="grade-filter-offers"
              className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 text-sm text-slate-700"
            >
              <Switch
                id="grade-filter-offers"
                checked={filters.offers}
                onCheckedChange={(checked) =>
                  updateParams({ offers: checked ? "1" : null })
                }
              />
              Only grades with live offers
            </label>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">
              Active:
            </span>
            {filters.q ? (
              <ActiveFilter
                label={`Search: ${filters.q}`}
                onRemove={() => {
                  setSearchInput("");
                  updateParams({ q: null });
                }}
              />
            ) : null}
            {filters.category ? (
              <ActiveFilter
                label={`Category: ${selectedCategory?.displayName ?? filters.category}`}
                onRemove={() => updateParams({ category: null, group: null })}
              />
            ) : null}
            {filters.group ? (
              <ActiveFilter
                label={`Grade group: ${filters.group}`}
                onRemove={() => updateParams({ group: null })}
              />
            ) : null}
            {filters.manufacturer ? (
              <ActiveFilter
                label={`Manufacturer: ${filters.manufacturer}`}
                onRemove={() => updateParams({ manufacturer: null })}
              />
            ) : null}
            {filters.offers ? (
              <ActiveFilter
                label="With live offers"
                onRemove={() => updateParams({ offers: null })}
              />
            ) : null}
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-brand hover:underline"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          {selectedCategory?.displayName ?? "All grades"}
        </h2>
        {directory.data ? (
          <p className="text-sm text-slate-500">
            {total.toLocaleString("en-IN")} grade{total === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      {directory.isLoading ? (
        <GradeTableSkeleton />
      ) : directory.isError && !directory.data ? (
        <MarketplaceEmptyState
          title="Unable to load grades"
          description={gradeDirectoryErrorMessage(
            directory.error,
            "Something went wrong while loading the Grade Directory.",
          )}
          action={
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => void directory.refetch()}
            >
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <MarketplaceEmptyState
          title="No grades found"
          description={
            hasActiveFilters
              ? "No grades match your current filters. Try a different search or clear filters."
              : "No grades are available in the directory yet."
          }
          onReset={hasActiveFilters ? clearFilters : undefined}
          action={
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={ROUTES.marketplace}>Browse live listings</Link>
            </Button>
          }
        />
      ) : (
        <>
          <GradeTable
            items={items}
            dimmed={directory.isPlaceholderData && directory.isFetching}
          />
          <MarketplacePagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
            onPageChange={(next) => {
              updateParams({ page: next > 1 ? String(next) : null });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </PageContainer>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-brand text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}

function ActiveFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-lg bg-brand/[0.06] px-2 py-1 font-medium text-brand">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-0.5 hover:bg-brand/10"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function gradeTitle(grade: GradeDirectoryItem): string {
  return grade.fullGradeName || grade.displayName || grade.name;
}

function GradeTable({
  items,
  dimmed,
}: {
  items: GradeDirectoryItem[];
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-opacity",
        dimmed && "opacity-60",
      )}
      aria-busy={dimmed}
    >
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[120px]">Grade No.</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Grade group</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Live offers</TableHead>
              <TableHead className="w-[90px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((grade) => {
              const href = marketplaceGradePath(grade.id);
              return (
                <TableRow key={grade.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {grade.gradeNo ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[340px]">
                    <Link
                      href={href}
                      className="block truncate font-semibold text-slate-900 hover:text-brand"
                      title={gradeTitle(grade)}
                    >
                      {gradeTitle(grade)}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        {grade.code}
                      </span>
                      {grade.inTodaysDelhiPriceList ? (
                        <DelhiPriceListBadge compact />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {grade.category?.displayName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {grade.gradeGroup ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {grade.manufacturer ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <LiveOfferCount count={grade.liveOfferCount} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-brand hover:text-brand"
                    >
                      <Link
                        href={href}
                        aria-label={`View ${gradeTitle(grade)}`}
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((grade) => (
          <li key={grade.id}>
            <Link
              href={marketplaceGradePath(grade.id)}
              className="flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-slate-50"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold text-slate-900">
                  {gradeTitle(grade)}
                </p>
                <p className="text-xs text-slate-500">
                  {[
                    grade.gradeNo,
                    grade.manufacturer,
                    grade.category?.displayName,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {grade.gradeGroup || grade.inTodaysDelhiPriceList ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {grade.gradeGroup ? (
                      <Badge
                        variant="secondary"
                        className="rounded-md text-[10px]"
                      >
                        {grade.gradeGroup}
                      </Badge>
                    ) : null}
                    {grade.inTodaysDelhiPriceList ? (
                      <DelhiPriceListBadge compact />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <LiveOfferCount count={grade.liveOfferCount} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GradeTableSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="hidden h-5 w-28 md:block" />
          <Skeleton className="hidden h-5 w-28 md:block" />
          <Skeleton className="hidden h-5 w-28 md:block" />
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  );
}
