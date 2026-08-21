"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function OrdersPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: OrdersPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages && total > 0;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-slate-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-xs font-medium text-slate-600">
          {page} / {totalPages}
        </span>
        <Button
          variant={canGoNext ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 rounded-lg",
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
