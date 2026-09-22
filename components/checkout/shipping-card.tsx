"use client";

import { MapPin, Pencil, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckoutAddress } from "@/services/checkout";

export function mapAddressLabel(address: CheckoutAddress): string {
  return address.label || address.city;
}

export function ShippingCard({
  address,
  onEditPress,
}: {
  address: CheckoutAddress;
  onEditPress: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
          <Truck className="h-4 w-4 text-accent-blue" />
          Shipping to
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2 text-sm font-semibold text-accent-blue hover:text-accent-blue"
          onClick={onEditPress}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <h2 className="text-base font-semibold text-slate-900">
        {mapAddressLabel(address)}
      </h2>
      <p className="mt-1.5 text-sm leading-5 text-slate-600">{address.line1}</p>
      {address.line2 ? (
        <p className="text-sm leading-5 text-slate-600">{address.line2}</p>
      ) : null}
      <p className="text-sm leading-5 text-slate-600">
        {address.city}, {address.state} - {address.postalCode}
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
        <MapPin className="h-3 w-3" />
        {address.landmark ?? `${address.city} delivery`}
      </div>
    </section>
  );
}

export function EmptyShippingCard({ onAddPress }: { onAddPress: () => void }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-base font-semibold text-slate-900">Shipping address</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        No saved address yet. Freight uses the platform estimate until a
        destination is added.
      </p>
      <Button
        type="button"
        className="mt-4 rounded-xl bg-brand hover:bg-brand-700"
        onClick={onAddPress}
      >
        <Plus className="h-4 w-4" />
        Add delivery address
      </Button>
    </section>
  );
}
