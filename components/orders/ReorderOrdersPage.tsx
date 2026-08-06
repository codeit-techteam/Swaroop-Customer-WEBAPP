"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Eye, ShoppingBag } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";
import { formatInr, formatInrPerMt, formatQuantityMt } from "@/lib/format";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

export function ReorderOrdersPage() {
  const router = useRouter();
  const items = useOrdersCatalogStore((s) => s.items);
  const filters = useOrdersCatalogStore((s) => s.filters);
  const setFilters = useOrdersCatalogStore((s) => s.setFilters);

  useEffect(() => {
    const finish = () => useOrdersCatalogStore.getState().setHydrated(true);
    const unsub = useOrdersCatalogStore.persist.onFinishHydration(finish);
    if (useOrdersCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const warehouses = useMemo(
    () => [...new Set(items.map((i) => i.warehouse))].sort(),
    [items],
  );
  const sellers = useMemo(
    () => [...new Set(items.map((i) => i.sellerName))].sort(),
    [items],
  );

  const rows = useMemo(
    () =>
      filterSortOrders(items, filters).filter(
        (r) => r.displayStatus === "delivered",
      ),
    [items, filters],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Reorder"
        description="Repeat previous delivered orders — opens the product page to add to cart again."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Reorder" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          warehouses={warehouses}
          sellers={sellers}
          statusOptions={["delivered"]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const prev = row.previousPricePerMt ?? row.pricePerMt;
            const curr = row.currentPricePerMt ?? row.pricePerMt;
            const delta = curr - prev;
            return (
              <Card key={row.id} className="border-slate-200 shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.grade} · {formatQuantityMt(row.quantityMt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {"Verified Supply Partner"} · {row.warehouse}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-[11px] uppercase text-slate-500">
                        Previous Price
                      </dt>
                      <dd className="font-medium">{formatInrPerMt(prev)}</dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-[11px] uppercase text-slate-500">
                        Current Price
                      </dt>
                      <dd className="font-medium">{formatInrPerMt(curr)}</dd>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <Badge
                        variant={
                          row.availability === "in_stock"
                            ? "success"
                            : row.availability === "limited"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {row.availability.replace("_", " ")}
                      </Badge>
                      <span
                        className={
                          delta > 0
                            ? "text-xs font-semibold text-red-600"
                            : delta < 0
                              ? "text-xs font-semibold text-emerald-600"
                              : "text-xs text-slate-500"
                        }
                      >
                        {delta === 0
                          ? "Price unchanged"
                          : `${delta > 0 ? "+" : ""}${formatInr(delta, { compact: true })} / MT`}
                      </span>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="h-10 rounded-xl bg-brand hover:bg-brand-700"
                      onClick={() =>
                        router.push(
                          `${ROUTES.purchaseRequestsCreate}?productId=${row.productId}&qty=${row.quantityMt}`,
                        )
                      }
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Reorder Now
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() =>
                        router.push(
                          `${ROUTES.marketplaceProduct}/${row.productId}`,
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                      View Product
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 rounded-xl"
                      onClick={() =>
                        router.push(
                          `${ROUTES.marketplaceProduct}/${row.productId}`,
                        )
                      }
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Compare Prices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
