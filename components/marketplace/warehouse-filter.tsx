"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MarketplaceWarehouse } from "@/types/marketplace";

interface WarehouseFilterProps {
  warehouses: MarketplaceWarehouse[];
  value: string | null;
  onChange: (warehouseId: string | null) => void;
}

export function WarehouseFilter({
  warehouses,
  value,
  onChange,
}: WarehouseFilterProps) {
  const selectValue = value ?? "wh-all";

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">
        Warehouse
      </legend>
      <Select
        value={selectValue}
        onValueChange={(next) => onChange(next === "wh-all" ? null : next)}
      >
        <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          {warehouses.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id}>
              {warehouse.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
}
