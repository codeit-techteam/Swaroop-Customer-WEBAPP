"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackingStatusLabel } from "@/mock/purchase-request/trackingRequests";
import type { TrackingListStatus } from "@/types/purchase-request-tracking";

export interface StatusFilterOption {
  value: string;
  label: string;
}

interface TrackingFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions?: TrackingListStatus[] | readonly TrackingListStatus[];
  statusFilterOptions?: StatusFilterOption[];
  warehouse?: string;
  onWarehouseChange?: (value: string) => void;
  warehouses?: string[];
  paymentType?: string;
  onPaymentTypeChange?: (value: string) => void;
  paymentTypes?: { id: string; title: string }[];
  showExtended?: boolean;
}

export function TrackingFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions = [],
  statusFilterOptions,
  warehouse = "all",
  onWarehouseChange,
  warehouses = [],
  paymentType = "all",
  onPaymentTypeChange,
  paymentTypes = [],
  showExtended = false,
}: TrackingFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search request ID, product, supply source…"
          className="h-10 rounded-xl pl-9"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-10 w-full rounded-xl lg:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusFilterOptions ? (
            statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {trackingStatusLabel(option)}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      {showExtended ? (
        <>
          <Select value={warehouse} onValueChange={onWarehouseChange}>
            <SelectTrigger className="h-10 w-full rounded-xl lg:w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentType} onValueChange={onPaymentTypeChange}>
            <SelectTrigger className="h-10 w-full rounded-xl lg:w-[180px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment types</SelectItem>
              {paymentTypes.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : null}
    </div>
  );
}
