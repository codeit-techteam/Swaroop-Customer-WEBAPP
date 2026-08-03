"use client";

import { Download, FileDown, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentMethodsMock } from "@/mock/purchase-request/paymentMethods";
import { ordersDisplayStatusLabel } from "@/mock/orders-catalog";
import type { OrdersDisplayStatus, OrdersSortBy } from "@/types/orders-catalog";
import type { OrdersCatalogFilters } from "@/store/ordersCatalogStore";

interface OrdersFiltersBarProps {
  filters: OrdersCatalogFilters;
  onChange: (patch: Partial<OrdersCatalogFilters>) => void;
  warehouses: string[];
  sellers: string[];
  statusOptions?: OrdersDisplayStatus[];
  onRefresh?: () => void;
}

export function OrdersFiltersBar({
  filters,
  onChange,
  warehouses,
  sellers,
  statusOptions = [
    "processing",
    "packed",
    "ready",
    "in_transit",
    "delivered",
    "cancelled",
  ],
  onRefresh,
}: OrdersFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search orders, PO, product, seller…"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => {
              onRefresh?.();
              toast.message("Orders refreshed");
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => toast.success("Orders export queued (CSV mock)")}
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => toast.success("Invoice pack download queued (mock)")}
          >
            <Download className="h-4 w-4" />
            Invoices
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Select
          value={filters.status}
          onValueChange={(v) =>
            onChange({ status: v as OrdersCatalogFilters["status"] })
          }
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {ordersDisplayStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.warehouse}
          onValueChange={(v) => onChange({ warehouse: v })}
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.seller}
          onValueChange={(v) => onChange({ seller: v })}
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sellers</SelectItem>
            {sellers.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentType}
          onValueChange={(v) => onChange({ paymentType: v })}
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment types</SelectItem>
            {paymentMethodsMock.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.deliveryType}
          onValueChange={(v) => onChange({ deliveryType: v })}
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Delivery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All delivery types</SelectItem>
            <SelectItem value="road">Road</SelectItem>
            <SelectItem value="container">Container</SelectItem>
            <SelectItem value="bulk_tanker">Bulk Tanker</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => onChange({ sortBy: v as OrdersSortBy })}
        >
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="amount_desc">Amount · High</SelectItem>
            <SelectItem value="amount_asc">Amount · Low</SelectItem>
            <SelectItem value="delivery_date">Delivery Date</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="h-10 rounded-xl"
          aria-label="From date"
        />
      </div>
    </div>
  );
}
