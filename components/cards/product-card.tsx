import type { ReactNode } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  subtitle?: string;
  priceLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  actions?: ReactNode;
  className?: string;
}

export function ProductCard({
  title,
  subtitle,
  priceLabel,
  imageSrc,
  imageAlt = "",
  actions,
  className,
}: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-[4/3] bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {priceLabel ? (
          <p className="text-lg font-semibold text-brand">{priceLabel}</p>
        ) : null}
      </CardContent>
      {actions ? <CardFooter>{actions}</CardFooter> : null}
    </Card>
  );
}
