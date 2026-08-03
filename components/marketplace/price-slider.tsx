"use client";

import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceSliderProps {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  className?: string;
}

export function PriceSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  className,
}: PriceSliderProps) {
  const range = max - min;
  const leftPercent = ((valueMin - min) / range) * 100;
  const rightPercent = ((valueMax - min) / range) * 100;

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="text-sm font-semibold text-slate-900">
        Price Range (MT)
      </legend>

      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(0, rightPercent - leftPercent)}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), valueMax - step);
            onChange(next, valueMax);
          }}
          className="pointer-events-none absolute inset-0 z-20 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), valueMin + step);
            onChange(valueMin, next);
          }}
          className="pointer-events-none absolute inset-0 z-30 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
          aria-label="Maximum price"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{formatInr(valueMin, { compact: true })}</span>
        <span>
          {valueMax >= max
            ? `${formatInr(max, { compact: true })}+`
            : formatInr(valueMax, { compact: true })}
        </span>
      </div>
    </fieldset>
  );
}
