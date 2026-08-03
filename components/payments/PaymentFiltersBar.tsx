"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/constants/payments";
import type {
  PaymentStatus,
  PaymentTypeId,
  PaymentsFiltersState,
} from "@/types/payments";

const STATUS_OPTIONS: Array<PaymentStatus | "all"> = [
  "all",
  "pending",
  "pending_payment",
  "payment_submitted",
  "verification_pending",
  "verified",
  "paid",
  "processing",
  "overdue",
  "rejected",
  "failed",
  "refunded",
  "cancelled",
  "need_clarification",
];

const TYPE_OPTIONS: Array<PaymentTypeId | "all"> = [
  "all",
  "advance",
  "on_loading",
  "on_delivery",
  "credit_15",
  "credit_30",
];

interface PaymentFiltersBarProps {
  filters: PaymentsFiltersState;
  warehouses: string[];
  sellers: string[];
  onChange: (patch: Partial<PaymentsFiltersState>) => void;
  onReset: () => void;
  hideType?: boolean;
  searchPlaceholder?: string;
}

export function PaymentFiltersBar({
  filters,
  warehouses,
  sellers,
  onChange,
  onReset,
  hideType,
  searchPlaceholder = "Search order, PO, invoice, UTR, seller…",
}: PaymentFiltersBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(v) =>
            onChange({ status: v as PaymentStatus | "all" })
          }
        >
          <SelectTrigger className="h-10 w-full rounded-xl lg:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Statuses" : PAYMENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!hideType ? (
          <Select
            value={filters.paymentType}
            onValueChange={(v) =>
              onChange({ paymentType: v as PaymentTypeId | "all" })
            }
          >
            <SelectTrigger className="h-10 w-full rounded-xl lg:w-[190px]">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All Types" : PAYMENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select
          value={filters.warehouse}
          onValueChange={(v) => onChange({ warehouse: v })}
        >
          <SelectTrigger className="h-10 w-full rounded-xl lg:w-[160px]">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
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
          <SelectTrigger className="h-10 w-full rounded-xl lg:w-[180px]">
            <SelectValue placeholder="Seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sellers</SelectItem>
            {sellers.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="h-10 rounded-xl" onClick={onReset}>
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="h-10 w-full rounded-xl sm:w-[160px]"
          aria-label="From date"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="h-10 w-full rounded-xl sm:w-[160px]"
          aria-label="To date"
        />
        <Select
          value={`${filters.sortBy}:${filters.sortDir}`}
          onValueChange={(v) => {
            const [sortBy, sortDir] = v.split(":") as [
              PaymentsFiltersState["sortBy"],
              PaymentsFiltersState["sortDir"],
            ];
            onChange({ sortBy, sortDir });
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-[200px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate:asc">Due Date ↑</SelectItem>
            <SelectItem value="dueDate:desc">Due Date ↓</SelectItem>
            <SelectItem value="amount:desc">Amount ↓</SelectItem>
            <SelectItem value="amount:asc">Amount ↑</SelectItem>
            <SelectItem value="paymentDate:desc">Payment Date ↓</SelectItem>
            <SelectItem value="orderNumber:asc">Order Number</SelectItem>
            <SelectItem value="status:asc">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
