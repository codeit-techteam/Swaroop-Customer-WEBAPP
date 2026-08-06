"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface AddToCartPanelProps {
  productId: string;
  moq: number;
  maxStock: number;
  packaging?: string;
  /** Controlled quantity — when provided, parent owns the value */
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
}

export function AddToCartPanel({
  productId,
  moq,
  maxStock,
  packaging,
  quantity: quantityProp,
  onQuantityChange,
  className,
}: AddToCartPanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [internalQty, setInternalQty] = useState(moq);
  const [error, setError] = useState<string | null>(null);

  const isControlled =
    quantityProp !== undefined && typeof onQuantityChange === "function";
  const qty = isControlled ? quantityProp : internalQty;

  function clamp(next: number) {
    return Math.max(moq, Math.min(maxStock, Math.round(next)));
  }

  function setQty(next: number) {
    if (isControlled) {
      onQuantityChange(next);
    } else {
      setInternalQty(next);
    }
  }

  function changeQty(next: number) {
    if (next < moq) {
      setError(`Minimum order is ${moq} MT`);
      setQty(moq);
      return;
    }
    setError(null);
    setQty(clamp(next));
  }

  function handleAdd() {
    const result = addItem(productId, qty, packaging);
    if (!result.ok) {
      setError(result.message);
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push(ROUTES.cart);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quantity (MT)
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            disabled={qty <= moq}
            onClick={() => changeQty(qty - 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={moq}
            max={maxStock}
            step={1}
            value={qty}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed)) changeQty(parsed);
            }}
            className="h-11 rounded-xl text-center font-semibold"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            disabled={qty >= maxStock}
            onClick={() => changeQty(qty + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Available {maxStock} MT</p>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>

      <Button
        type="button"
        className="h-12 w-full rounded-xl bg-brand text-sm font-semibold hover:bg-brand-700"
        onClick={handleAdd}
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </Button>
      <Button
        asChild
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl text-sm font-semibold"
      >
        <Link href={ROUTES.marketplace}>
          <Store className="h-4 w-4" />
          Continue Shopping
        </Link>
      </Button>
    </div>
  );
}
