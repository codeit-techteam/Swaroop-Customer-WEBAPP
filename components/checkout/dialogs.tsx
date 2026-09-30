"use client";

import { type ReactNode } from "react";
import { AlertCircle, Clock3, Info, MapPin, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatInrPerMt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartPriceChange, CheckoutAddress } from "@/services/checkout";
import { mapAddressLabel } from "./shipping-card";

function DialogIcon({
  tone,
  children,
}: {
  tone: "amber" | "blue" | "red";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
        tone === "amber" && "bg-amber-50 text-amber-700",
        tone === "blue" && "bg-accent-blue/10 text-accent-blue",
        tone === "red" && "bg-red-50 text-red-600",
      )}
    >
      {children}
    </div>
  );
}

export function PriceUpdatedDialog({
  open,
  changes,
  onReview,
  onContinue,
}: {
  open: boolean;
  changes: CartPriceChange[];
  onReview: () => void;
  onContinue?: () => void;
}) {
  const primary = changes[0];
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onReview()}>
      <DialogContent className="max-w-md text-center sm:rounded-2xl">
        <DialogIcon tone="blue">
          <Info className="h-8 w-8" />
        </DialogIcon>
        <DialogHeader className="sm:text-center">
          <DialogTitle className="text-xl">Price Updated</DialogTitle>
          <DialogDescription className="text-[14px] leading-[21px]">
            The latest PetroTrade price for this product has changed. Review the
            current market price before continuing.
          </DialogDescription>
        </DialogHeader>
        {primary ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
            <p className="text-sm font-semibold text-slate-900">
              {primary.productName}
            </p>
            {primary.gradeName ? (
              <p className="mt-0.5 text-[11px] text-slate-400">
                {primary.gradeName}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Previous
                </p>
                <p className="mt-0.5 text-[13px] text-slate-600">
                  {formatInrPerMt(primary.oldUnitPrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Current
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-accent-blue">
                  {formatInrPerMt(primary.newUnitPrice)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="h-11 w-full rounded-xl bg-brand hover:bg-brand-700"
            onClick={onReview}
          >
            Review Updated Price
          </Button>
          {onContinue ? (
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl"
              onClick={onContinue}
            >
              Continue to Checkout
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuoteExpiredDialog({
  open,
  refreshing,
  onRefresh,
  onClose,
}: {
  open: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md text-center sm:rounded-2xl">
        <DialogIcon tone="amber">
          <Clock3 className="h-8 w-8" />
        </DialogIcon>
        <DialogHeader className="sm:text-center">
          <DialogTitle className="text-xl">Price Quote Expired</DialogTitle>
          <DialogDescription className="text-[14px] leading-[21px]">
            Pricing has been refreshed because the previous quote is no longer
            valid.
          </DialogDescription>
        </DialogHeader>
        <Button
          className="h-11 w-full rounded-xl bg-brand hover:bg-brand-700"
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refreshing ? "Refreshing..." : "Refresh Pricing"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function NetworkErrorDialog({
  open,
  retrying,
  title = "Unable to refresh pricing",
  message = "Unable to refresh pricing. Please check your connection and try again.",
  onRetry,
  onClose,
}: {
  open: boolean;
  retrying?: boolean;
  title?: string;
  message?: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md text-center sm:rounded-2xl">
        <DialogIcon tone="red">
          <AlertCircle className="h-8 w-8" />
        </DialogIcon>
        <DialogHeader className="sm:text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-[14px] leading-[21px]">
            {message}
          </DialogDescription>
        </DialogHeader>
        <Button
          className="h-11 w-full rounded-xl bg-brand hover:bg-brand-700"
          disabled={retrying}
          onClick={onRetry}
        >
          {retrying ? "Retrying..." : "Retry"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function CheckoutValidationDialog({
  open,
  title,
  message,
  confirmLabel = "OK",
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onConfirm()}>
      <DialogContent className="max-w-md text-center sm:rounded-2xl">
        <DialogIcon tone="red">
          <AlertCircle className="h-8 w-8" />
        </DialogIcon>
        <DialogHeader className="sm:text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-[14px] leading-[21px]">
            {message}
          </DialogDescription>
        </DialogHeader>
        <Button
          className="h-11 w-full rounded-xl bg-brand hover:bg-brand-700"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function AddressSelectSheet({
  open,
  selectedId,
  addresses,
  onOpenChange,
  onSelect,
  onAddAddress,
}: {
  open: boolean;
  selectedId: string;
  addresses: CheckoutAddress[];
  onOpenChange: (open: boolean) => void;
  onSelect: (addressId: string) => void;
  onAddAddress: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Select Shipping Address</SheetTitle>
          <SheetDescription>
            Addresses saved in the Customer APP or WEBAPP for your organization
            appear here for freight and checkout.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {addresses.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No saved addresses yet. Add one here or in the Customer APP — they
              sync for the same login.
            </p>
          ) : null}
          {addresses.map((address) => {
            const selected = address.id === selectedId;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition",
                  selected
                    ? "border-accent-blue bg-accent-blue/5 ring-1 ring-accent-blue/20"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-[15px] font-semibold",
                          selected ? "text-accent-blue" : "text-slate-900",
                        )}
                      >
                        {mapAddressLabel(address)}
                      </p>
                      {selected ? (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-blue" />
                      ) : null}
                    </div>
                    <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""},{" "}
                        {address.city}, {address.state}
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onAddAddress}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent-blue py-3 text-sm font-semibold text-accent-blue"
          >
            <Plus className="h-4 w-4" />
            Add new address
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { AddAddressDialog } from "@/components/location/add-address-dialog";
