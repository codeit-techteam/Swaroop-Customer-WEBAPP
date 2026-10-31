"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants";
import {
  gradeRequestPath,
  listGradeRequests,
  type GradeRequest,
} from "@/services/grade-requests";
import { GradeRequestStatusBadge } from "./status-badge";

export function GradeRequestsList() {
  const [items, setItems] = useState<GradeRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (target: number) => {
    if (target === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await listGradeRequests(target, 20);
      setItems((cur) => (target === 1 ? res.items : [...cur, ...res.items]));
      setPage(target);
      setTotalPages(res.meta.totalPages);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load your requests.",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <PageContainer className="max-w-4xl space-y-5">
      <PageHeader
        title="My grade requests"
        description="Track the grades you asked us to add or source."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Grade requests" },
        ]}
        actions={
          <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
            <Link href={ROUTES.marketplaceGradeRequestNew}>
              <FilePlus2 className="mr-2 h-4 w-4" aria-hidden />
              Request a new grade
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <MarketplaceEmptyState
          title="Unable to load requests"
          description={error}
          action={
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => void load(1)}
            >
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <MarketplaceEmptyState
          title="No grade requests yet"
          description="If you can't find a grade in the catalogue, request it and we will source it for you."
          action={
            <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
              <Link href={ROUTES.marketplaceGradeRequestNew}>
                Request a new grade
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((r) => (
              <li key={r.id}>
                <Link
                  href={gradeRequestPath(r.id)}
                  className="block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {r.gradeName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.referenceNumber}
                        {r.manufacturer ? ` · ${r.manufacturer}` : ""} ·{" "}
                        {r.quantity} {r.unit}
                      </p>
                    </div>
                    <GradeRequestStatusBadge
                      status={r.status}
                      label={r.statusLabel}
                    />
                  </div>
                  {r.awaitingCustomerResponse ? (
                    <p className="mt-2 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-800">
                      We need more information from you.
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted{" "}
                    {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {error ? (
            <p className="text-center text-sm text-red-600">{error}</p>
          ) : null}
          {page < totalPages ? (
            <div className="text-center">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={loadingMore}
                onClick={() => void load(page + 1)}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
