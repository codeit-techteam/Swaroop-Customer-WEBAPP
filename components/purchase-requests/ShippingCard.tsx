"use client";

import { AddressCard } from "./AddressCard";
import type { ShippingAddress } from "@/types/purchase-request";

interface ShippingCardProps {
  address: ShippingAddress;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Shipping destination card — thin alias over AddressCard for PR composition. */
export function ShippingCard({
  address,
  selected,
  onSelect,
  className,
}: ShippingCardProps) {
  return (
    <AddressCard
      address={address}
      selected={selected}
      onSelect={onSelect}
      title="Shipping Address"
      className={className}
    />
  );
}
