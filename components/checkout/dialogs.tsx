"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Clock3,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Plus,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  createCustomerAddress,
  updateCustomerAddress,
} from "@/services/addresses";
import type { CartPriceChange, CheckoutAddress } from "@/services/checkout";
import { checkoutErrorMessage } from "@/services/checkout";
import {
  fetchCurrentDeliveryAddress,
  LocationAccessError,
  lookupPincode,
} from "@/services/location";
import { INDIAN_PINCODE_REGEX } from "./constants";
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

const EMPTY_ADDRESS = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  landmark: "",
};

export function AddAddressDialog({
  open,
  onOpenChange,
  onCreated,
  onSaved,
  initial,
  saveAddress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** @deprecated Prefer onSaved — kept for checkout / location selector callers. */
  onCreated?: (address: CheckoutAddress) => void;
  onSaved?: (address: CheckoutAddress) => void;
  initial?: CheckoutAddress | null;
  /** Prefer store-backed saves (create/update) when managing profile addresses. */
  saveAddress?: (input: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    type: "SHIPPING";
  }) => Promise<CheckoutAddress>;
}) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [lookingUpPin, setLookingUpPin] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ADDRESS);
      setCoords(null);
      setDetecting(false);
      setLookingUpPin(false);
      return;
    }
    if (initial) {
      setForm({
        label: initial.label ?? "",
        line1: initial.line1 ?? "",
        line2: initial.line2 ?? "",
        city: initial.city ?? "",
        state: initial.state ?? "",
        postalCode: initial.postalCode ?? "",
        landmark: initial.landmark ?? "",
      });
      setCoords(
        initial.latitude != null && initial.longitude != null
          ? { latitude: initial.latitude, longitude: initial.longitude }
          : null,
      );
    } else {
      setForm(EMPTY_ADDRESS);
      setCoords(null);
    }
  }, [open, initial]);

  function setField(key: keyof typeof EMPTY_ADDRESS, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePostalCodeChange(value: string) {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    setField("postalCode", pin);
    if (pin.length !== 6 || !INDIAN_PINCODE_REGEX.test(pin)) return;

    setLookingUpPin(true);
    try {
      const hits = await lookupPincode(pin);
      const first = hits[0];
      if (!first) return;
      setForm((prev) => ({
        ...prev,
        postalCode: pin,
        city: prev.city.trim() || first.city,
        state: prev.state.trim() || first.state,
        line1: prev.line1.trim() || first.name || first.city,
      }));
    } finally {
      setLookingUpPin(false);
    }
  }

  async function handleUseCurrentLocation() {
    setDetecting(true);
    try {
      const resolved = await fetchCurrentDeliveryAddress();
      setForm((prev) => ({
        label: prev.label.trim() || resolved.label || "Current location",
        line1: prev.line1.trim() || resolved.line1,
        line2: prev.line2.trim() || resolved.line2 || "",
        city: resolved.city || prev.city,
        state: resolved.state || prev.state,
        postalCode: resolved.postalCode || prev.postalCode,
        landmark: prev.landmark.trim() || resolved.landmark || "",
      }));
      setCoords({
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      });
      toast.success("Location detected — review and save");
    } catch (cause) {
      toast.error(
        cause instanceof LocationAccessError
          ? cause.message
          : "Unable to fetch current location. Enter the address manually.",
      );
    } finally {
      setDetecting(false);
    }
  }

  async function handleSave() {
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error("Fill address, city, and state");
      return;
    }
    if (!INDIAN_PINCODE_REGEX.test(form.postalCode.trim())) {
      toast.error("Enter a valid 6-digit Indian pincode");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim() || form.city.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        landmark: form.landmark.trim() || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        type: "SHIPPING" as const,
      };
      const address = saveAddress
        ? await saveAddress(payload)
        : isEdit && initial
          ? await updateCustomerAddress(initial.id, payload)
          : await createCustomerAddress(payload);
      onSaved?.(address);
      onCreated?.(address);
      setForm(EMPTY_ADDRESS);
      setCoords(null);
      onOpenChange(false);
      toast.success(isEdit ? "Address updated" : "Delivery address added");
    } catch (cause) {
      toast.error(
        checkoutErrorMessage(
          cause,
          isEdit ? "Unable to update address" : "Unable to save address",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit delivery address" : "Add delivery address"}
          </DialogTitle>
          <DialogDescription>
            Saved to your PetroTrade organization for checkout and freight —
            shared with the Customer APP for the same login.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          disabled={detecting || saving}
          onClick={() => void handleUseCurrentLocation()}
          className="flex w-full items-center gap-3 rounded-xl border border-accent-blue/30 bg-accent-blue/5 px-4 py-3 text-left transition hover:bg-accent-blue/10 disabled:opacity-60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
            {detecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-accent-blue">
              {detecting ? "Detecting location…" : "Use current location"}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Auto-fill from GPS — same as the Customer APP
            </span>
          </span>
        </button>

        <div className="grid gap-3">
          {(
            [
              ["label", "Location name"],
              ["line1", "Address line 1"],
              ["line2", "Address line 2 (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "PIN code"],
              ["landmark", "Landmark (optional)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label>
                {label}
                {key === "postalCode" && lookingUpPin ? (
                  <span className="ml-2 text-[11px] font-normal text-slate-400">
                    Looking up…
                  </span>
                ) : null}
              </Label>
              <Input
                value={form[key]}
                onChange={(event) => {
                  if (key === "postalCode") {
                    void handlePostalCodeChange(event.target.value);
                    return;
                  }
                  setField(key, event.target.value);
                }}
                inputMode={key === "postalCode" ? "numeric" : undefined}
                maxLength={key === "postalCode" ? 6 : undefined}
                className="rounded-xl"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            disabled={saving || detecting}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Save address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
