import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DelhiPriceListBadge({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Badge
      variant="info"
      className={cn(
        "rounded-md font-semibold",
        compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs",
      )}
      title="Listed in today's Delhi price list"
    >
      {compact ? "Delhi list" : "In today's Delhi price list"}
    </Badge>
  );
}

export function LiveOfferCount({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="text-xs font-medium text-slate-400">None</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700">
      <Radio className="h-3 w-3" aria-hidden />
      {count.toLocaleString("en-IN")}
      <span className="sr-only"> live offers</span>
    </span>
  );
}
