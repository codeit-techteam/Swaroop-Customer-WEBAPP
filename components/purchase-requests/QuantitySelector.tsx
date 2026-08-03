"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  moq: number;
  max: number;
  increment?: number;
  onChange: (value: number) => void;
  error?: string | null;
  className?: string;
}

export function QuantitySelector({
  value,
  moq,
  max,
  increment = 1,
  onChange,
  error,
  className,
}: QuantitySelectorProps) {
  const clamp = (next: number) =>
    Math.max(moq, Math.min(max, Math.round(next)));

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="quantity-mt">Quantity (MT)</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrease quantity"
          disabled={value <= moq}
          onClick={() => onChange(clamp(value - increment))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id="quantity-mt"
          type="number"
          min={moq}
          max={max}
          step={increment}
          value={value}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isFinite(parsed)) onChange(clamp(parsed));
          }}
          className="h-10 text-center font-semibold"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increase quantity"
          disabled={value >= max}
          onClick={() => onChange(clamp(value + increment))}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        MOQ {moq} MT · Available {max} MT · Increment {increment} MT
      </p>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
