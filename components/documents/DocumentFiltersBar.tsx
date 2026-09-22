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
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "@/constants/documents";
import type {
  DocumentStatus,
  DocumentType,
  DocumentsFiltersState,
} from "@/types/documents";

const STATUS_OPTIONS: Array<DocumentStatus | "all"> = [
  "all",
  "generated",
  "downloaded",
  "pending",
  "approved",
  "verified",
  "cancelled",
];

const TYPE_OPTIONS: Array<DocumentType | "all"> = [
  "all",
  "purchase_order",
  "invoice",
  "proforma",
  "packing_list",
  "delivery_challan",
  "e_way_bill",
  "transport_receipt",
  "receipt",
  "payment_proof",
];

interface DocumentFiltersBarProps {
  filters: DocumentsFiltersState;
  warehouses: string[];
  sellers: string[];
  onChange: (patch: Partial<DocumentsFiltersState>) => void;
  onReset: () => void;
  hideType?: boolean;
  searchPlaceholder?: string;
}

export function DocumentFiltersBar({
  filters,
  warehouses,
  sellers,
  onChange,
  onReset,
  hideType,
  searchPlaceholder = "Search order, PO, invoice, product, supply source, warehouse, document no…",
}: DocumentFiltersBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {!hideType ? (
            <Select
              value={filters.documentType}
              onValueChange={(v) =>
                onChange({ documentType: v as DocumentType | "all" })
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All Types" : DOCUMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Select
            value={filters.status}
            onValueChange={(v) =>
              onChange({ status: v as DocumentStatus | "all" })
            }
          >
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Statuses" : DOCUMENT_STATUS_LABELS[s]}
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
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Supply Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Supply Sources</SelectItem>
              {sellers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="h-10 rounded-xl"
            aria-label="From date"
          />

          <Select
            value={filters.sortBy}
            onValueChange={(v) =>
              onChange({ sortBy: v as DocumentsFiltersState["sortBy"] })
            }
          >
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl text-slate-600"
            onClick={onReset}
          >
            <X className="h-4 w-4" />
            Reset filters
          </Button>
        </div>
      </div>
    </div>
  );
}
