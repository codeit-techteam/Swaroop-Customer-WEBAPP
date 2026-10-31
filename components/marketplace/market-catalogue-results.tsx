"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FilePlus2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { LiveOfferCount } from "@/components/marketplace/grades/grade-badges";
import { MarketplacePagination } from "@/components/marketplace/pagination";
import { ROUTES, marketplaceGradePath } from "@/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { useGradeDirectory } from "@/hooks/use-grade-directory";
import { gradeDirectoryErrorMessage } from "@/services/grade-directory";
import { cn } from "@/lib/utils";
import type { GradeDirectoryItem } from "@/types/grade-directory";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 350;

function gradeTitle(grade: GradeDirectoryItem): string {
  return grade.fullGradeName || grade.displayName || grade.name;
}

function gradeIdentity(grade: GradeDirectoryItem): string {
  return (
    [grade.gradeNo, grade.manufacturer].filter(Boolean).join(" · ") ||
    grade.code
  );
}

type MarketCatalogueResultsProps = {
  search: string;
  page?: number;
  onPageChange?: (page: number) => void;
  onClearSearch?: () => void;
  className?: string;
};

export function MarketCatalogueResults({
  search,
  page = 1,
  onPageChange,
  onClearSearch,
  className,
}: MarketCatalogueResultsProps) {
  const trimmed = search.trim();
  const debouncedSearch = useDebounce(trimmed, SEARCH_DEBOUNCE_MS);
  const isPending = trimmed.length > 0 && trimmed !== debouncedSearch;

  const directory = useGradeDirectory({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const items = directory.data?.items ?? [];
  const meta = directory.data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const gradesHref = debouncedSearch
    ? `${ROUTES.marketplaceGrades}?q=${encodeURIComponent(debouncedSearch)}`
    : ROUTES.marketplaceGrades;

  const showSkeleton =
    directory.isLoading ||
    (isPending && items.length === 0 && !directory.isError);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          {showSkeleton || directory.isPlaceholderData
            ? "Searching grades…"
            : `${total.toLocaleString("en-IN")} grade${total === 1 ? "" : "s"} for “${trimmed}”`}
        </p>
        <Button asChild variant="outline" size="sm" className="h-9 rounded-xl">
          <Link href={gradesHref}>
            <BookOpen className="h-4 w-4" aria-hidden />
            Search all grades for “{trimmed}”
          </Link>
        </Button>
      </div>

      {showSkeleton ? (
        <CatalogueSkeleton />
      ) : directory.isError && !directory.data ? (
        <MarketplaceEmptyState
          title="Search failed"
          description={gradeDirectoryErrorMessage(
            directory.error,
            "Something went wrong while searching grades.",
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
          title={`No grades found for “${trimmed}”`}
          description="Try a grade code, material, or manufacturer — or request the grade and we will source it."
          action={
            <>
              <Button
                asChild
                className="rounded-xl bg-brand hover:bg-brand-700"
              >
                <Link
                  href={`${ROUTES.marketplaceGradeRequestNew}${
                    trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""
                  }`}
                >
                  <FilePlus2 className="mr-2 h-4 w-4" aria-hidden />
                  Request a new grade
                </Link>
              </Button>
              {onClearSearch ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={onClearSearch}
                >
                  Clear search
                </Button>
              ) : null}
            </>
          }
        />
      ) : (
        <>
          <ul
            className={cn(
              "divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-opacity",
              directory.isPlaceholderData &&
                directory.isFetching &&
                "opacity-60",
            )}
          >
            {items.map((grade) => (
              <li key={grade.id}>
                <Link
                  href={marketplaceGradePath(grade.id)}
                  className="flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-slate-50"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {grade.category?.displayName ? (
                        <Badge
                          variant="secondary"
                          className="rounded-md bg-brand/[0.08] text-[10px] text-brand"
                        >
                          {grade.category.displayName}
                        </Badge>
                      ) : null}
                      {grade.gradeGroup ? (
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[10px]"
                        >
                          {grade.gradeGroup}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="truncate font-semibold text-slate-900">
                      {gradeTitle(grade)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {gradeIdentity(grade)}
                    </p>
                    <LiveOfferCount
                      count={grade.liveOfferCount}
                      labelWhenEmpty
                    />
                  </div>
                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && onPageChange ? (
            <MarketplacePagination
              page={Math.min(page, totalPages)}
              totalPages={totalPages}
              from={from}
              to={to}
              total={total}
              onPageChange={onPageChange}
            />
          ) : null}
          {page >= totalPages ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center">
              <p className="text-sm text-slate-500">
                Can&apos;t find your grade?
              </p>
              <Button asChild variant="link" className="h-auto p-0 text-brand">
                <Link
                  href={`${ROUTES.marketplaceGradeRequestNew}${
                    trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""
                  }`}
                >
                  Request a new grade
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 border-b border-slate-100 py-3 last:border-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
