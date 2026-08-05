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
  destinationStates: string[];
}

const STATUSES = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

export function ShipmentFiltersBar({
  filters,
  onChange,
  onReset,
  warehouses,
  transporters,
  destinationStates,
}: ShipmentFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search order, PO, product, vehicle, transporter, warehouse, destination…"
          className="rounded-xl pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <SelectValue placeholder="Transporter" />
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
          value={filters.destinationState}
          onValueChange={(v) => onChange({ destinationState: v })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="State" />
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
