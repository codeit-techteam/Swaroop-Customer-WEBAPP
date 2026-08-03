import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start gap-4 p-6">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold">{value}</p>
          {helper ? (
            <p className="text-xs text-muted-foreground">{helper}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
