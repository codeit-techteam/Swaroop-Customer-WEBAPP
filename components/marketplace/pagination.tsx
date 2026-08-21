"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketplacePaginationProps {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, 5];
  if (page >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [page - 2, page - 1, page, page + 1, page + 2];
}

export function MarketplacePagination({
  page,
  totalPages,
  from,
  to,
  total,
  onPageChange,
  className,
}: MarketplacePaginationProps) {
  if (total === 0) return null;

  const pages = buildPageNumbers(page, totalPages);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {from}-{to}
        </span>{" "}
        of <span className="font-medium text-slate-700">{total}</span> results
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg text-sm font-semibold",
              pageNumber === page && "bg-brand hover:bg-brand-700",
            )}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant={canGoNext ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-9 rounded-lg",
            canGoNext && "bg-brand text-white hover:bg-brand-700",
          )}
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
