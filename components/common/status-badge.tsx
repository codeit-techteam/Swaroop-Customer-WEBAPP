import { Badge } from "@/components/ui/badge";
import { statusColor } from "@/utils/statusColor";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const toneToVariant = {
  default: "secondary",
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "outline",
} as const;

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const tone = statusColor(status);
  return (
    <Badge
      variant={toneToVariant[tone]}
      className={cn("capitalize", className)}
    >
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
