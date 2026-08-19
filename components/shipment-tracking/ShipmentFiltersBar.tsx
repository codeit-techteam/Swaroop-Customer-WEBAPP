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
}

const STATUSES = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

export function ShipmentFiltersBar({
  filters,
  onChange,
  onReset,
}: ShipmentFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search order, PO, product, vehicle, destination…"
          className="rounded-xl pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status}
          onValueChange={(v) =>
            onChange({ status: v as ShipmentFiltersState["status"] })
          }
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[220px]">
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
