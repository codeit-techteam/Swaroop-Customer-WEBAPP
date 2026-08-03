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
import { SHIPMENT_STATUS_LABELS } from "@/types/shipment-tracking";
import type {
  ShipmentFiltersState,
  ShipmentStatus,
} from "@/types/shipment-tracking";

interface ShipmentFiltersBarProps {
  filters: ShipmentFiltersState;
  onChange: (partial: Partial<ShipmentFiltersState>) => void;
  onReset: () => void;
  warehouses: string[];
  transporters: string[];
  sellers: string[];
  destinationStates: string[];
}

const STATUSES = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

export function ShipmentFiltersBar({
  filters,
  onChange,
  onReset,
  warehouses,
  transporters,
  sellers,
  destinationStates,
}: ShipmentFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search order, PO, vehicle, transporter, driver, invoice, product, warehouse…"
          className="rounded-xl pl-9"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select
          value={filters.status}
          onValueChange={(v) =>
            onChange({ status: v as ShipmentFiltersState["status"] })
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.warehouse}
          onValueChange={(v) => onChange({ warehouse: v })}
        >
          <SelectTrigger className="rounded-xl">
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
          value={filters.transportCompany}
          onValueChange={(v) => onChange({ transportCompany: v })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Transport Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transporters</SelectItem>
            {transporters.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.seller}
          onValueChange={(v) => onChange({ seller: v })}
        >
          <SelectTrigger className="rounded-xl">
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

        <Select
          value={filters.destinationState}
          onValueChange={(v) => onChange({ destinationState: v })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Destination State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {destinationStates.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.expectedDateFrom}
          onChange={(e) => onChange({ expectedDateFrom: e.target.value })}
          className="rounded-xl"
          aria-label="Expected delivery from"
        />
        <Input
          type="date"
          value={filters.expectedDateTo}
          onChange={(e) => onChange({ expectedDateTo: e.target.value })}
          className="rounded-xl"
          aria-label="Expected delivery to"
        />

        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onReset}
        >
          <X className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
