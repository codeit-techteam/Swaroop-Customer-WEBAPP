import { Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "info" | "security" | "success" | "neutral";
  className?: string;
}

const variantStyles: Record<NonNullable<InfoCardProps["variant"]>, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  security: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

const iconStyles: Record<NonNullable<InfoCardProps["variant"]>, string> = {
  info: "text-sky-600",
  security: "text-sky-600",
  success: "text-emerald-600",
  neutral: "text-slate-500",
};

export function InfoCard({
  title,
  children,
  icon: Icon = Info,
  variant = "info",
  className,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
      role="note"
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", iconStyles[variant])}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
