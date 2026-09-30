"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  Check,
  Loader2,
  LocateFixed,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AddAddressDialog } from "@/components/checkout/dialogs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deliveryLocationBadge,
  formatDeliveryLabel,
  GPS_LOCATION_ID,
} from "@/constants/locations";
import { useDeliveryLocation } from "@/hooks/use-delivery-location";
import { cn } from "@/lib/utils";
import {
  fetchCurrentDeliveryAddress,
  LocationAccessError,
  type ResolvedGeoAddress,
} from "@/services/location";
import type { CheckoutAddress } from "@/services/checkout";
import { useAuthStore } from "@/store/authStore";
import { toDeliveryLocation } from "@/store/deliveryLocationStore";

function cityLabel(city?: string | null, fallback = "Select location") {
  const trimmed = city?.trim();
  return trimmed || fallback;
}

function addressSubtitle(address: CheckoutAddress) {
  const lines = [
    address.line1,
    address.line2,
    formatDeliveryLabel({
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
    }),
  ]
    .filter(Boolean)
    .join(", ");
  return lines;
}

/**
 * Header delivery location control — visual language matches the existing
 * PetroTrade web header chip (MapPin + city + badge), with Customer APP
 * delivery-address behavior (GPS + saved addresses + checkout wiring).
 */
export function LocationSelector({ compact = false }: { compact?: boolean }) {
  const authReady = useAuthStore(
    (state) => state.isAuthenticated && Boolean(state.user?.id),
  );
  const {
    selectedLocation,
    addresses,
    selectedAddressId,
    detecting,
    isSyncing,
    lastError,
    isHydrated,
    selectSavedAddress,
    selectLocation,
    applyResolvedLocation,
    setDetecting,
    setLastError,
    refreshAddresses,
  } = useDeliveryLocation();

  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detectedFormatted, setDetectedFormatted] = useState<string | null>(
    null,
  );
  const [permissionHint, setPermissionHint] = useState<string | null>(null);
  const [lastResolved, setLastResolved] = useState<ResolvedGeoAddress | null>(
    null,
  );
  const [prefill, setPrefill] = useState<ResolvedGeoAddress | null>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) {
      setPermissionHint(null);
      setDetectedFormatted(null);
    }
  }, [open]);

  const badge = selectedLocation
    ? (selectedLocation.badge ??
      deliveryLocationBadge(
        selectedLocation,
        addresses.find((row) => row.id === selectedLocation.addressId),
      ))
    : "CURRENT";

  const handleUseCurrentLocation = useCallback(async () => {
    setDetecting(true);
    setPermissionHint(null);
    setDetectedFormatted(null);
    setLastError(null);
    try {
      const resolved = await fetchCurrentDeliveryAddress();
      setLastResolved(resolved);
      const location = await applyResolvedLocation(resolved, {
        persistAddress: false,
      });
      setDetectedFormatted(
        [
          resolved.line1,
          formatDeliveryLabel({
            city: resolved.city,
            state: resolved.state,
            pincode: resolved.postalCode,
            area: resolved.landmark,
          }),
        ]
          .filter(Boolean)
          .join(" · "),
      );
      selectLocation(location);
      toast.success(`Delivering to ${location.city}`);
    } catch (cause) {
      const access = cause instanceof LocationAccessError ? cause : null;
      const message =
        access?.message ??
        "Unable to determine your location. Please try again or select a saved address.";
      setPermissionHint(message);
      setLastError(message);
      if (access?.code === "PERMISSION_DENIED") {
        toast.error(
          "Location permission is disabled. You can select a saved address instead.",
        );
      } else {
        toast.error(message);
      }
    } finally {
      setDetecting(false);
    }
  }, [applyResolvedLocation, selectLocation, setDetecting, setLastError]);

  /** Saving a detected location always goes through the confirm step. */
  const handleSaveCurrentAsAddress = useCallback(() => {
    if (
      !lastResolved &&
      selectedLocation &&
      (selectedLocation.source === "gps" ||
        selectedLocation.source === "pincode")
    ) {
      setPrefill({
        label: selectedLocation.landmark || undefined,
        line1: selectedLocation.line1 || "",
        line2: selectedLocation.line2 ?? undefined,
        city: selectedLocation.city,
        state: selectedLocation.state,
        postalCode: selectedLocation.pincode,
        country: "IN",
        landmark: selectedLocation.landmark ?? undefined,
        latitude: selectedLocation.latitude ?? 0,
        longitude: selectedLocation.longitude ?? 0,
        source: selectedLocation.source === "pincode" ? "pincode" : "google",
      });
    } else {
      setPrefill(lastResolved);
    }
    setAddOpen(true);
    setOpen(false);
  }, [lastResolved, selectedLocation]);

  const openNewAddress = useCallback(() => {
    setPrefill(null);
    setAddOpen(true);
    setOpen(false);
  }, []);

  const handleSelectSaved = useCallback(
    (address: CheckoutAddress) => {
      selectSavedAddress(address);
      toast.success(`Delivering to ${address.city}`);
      setOpen(false);
    },
    [selectSavedAddress],
  );

  if (!authReady) {
    return null;
  }

  if (!isHydrated) {
    return (
      <Button
        variant="outline"
        className="h-9 gap-2 border-slate-200 bg-white px-3 text-slate-500"
        disabled
        aria-busy
      >
        <MapPin className="h-4 w-4 animate-pulse" />
        {!compact ? (
          <span>Loading…</span>
        ) : (
          <span className="sr-only">Loading location</span>
        )}
      </Button>
    );
  }

  const displayCity = detecting
    ? "Detecting..."
    : cityLabel(selectedLocation?.city, "Select location");

  const currentSelected =
    selectedLocation?.id === GPS_LOCATION_ID ||
    selectedLocation?.source === "gps";

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 max-w-[220px] gap-2 border-slate-200 bg-white px-3 text-left font-medium text-slate-700",
              compact && "px-2",
            )}
            aria-label={
              selectedLocation
                ? `Delivery location ${selectedLocation.city}, ${badge}`
                : "Select delivery location"
            }
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={labelId}
          >
            <MapPin
              className={cn(
                "h-4 w-4 shrink-0 text-accent-blue",
                detecting && "animate-pulse",
              )}
            />
            {!compact ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{displayCity}</span>
                {selectedLocation || detecting ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      detecting
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {detecting ? "…" : badge}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="sr-only">{displayCity}</span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          id={labelId}
          align="end"
          className="w-[min(100vw-1.5rem,22rem)] p-0"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-sm font-semibold text-slate-900">
              Delivery Location
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-blue"
              onClick={(event) => {
                event.preventDefault();
                void refreshAddresses();
              }}
            >
              <RefreshCw
                className={cn("h-3 w-3", isSyncing && "animate-spin")}
              />
              Refresh
            </button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="m-0" />

          <div className="max-h-[min(70vh,28rem)] space-y-3 overflow-y-auto p-3">
            <div
              className={cn(
                "rounded-xl border px-3 py-3 transition",
                currentSelected
                  ? "border-accent-blue bg-accent-blue/5 ring-1 ring-accent-blue/20"
                  : "border-slate-200 bg-white",
              )}
            >
              <button
                type="button"
                disabled={detecting}
                onClick={() => void handleUseCurrentLocation()}
                className={cn(
                  "flex w-full items-start gap-3 text-left",
                  detecting && "opacity-80",
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                  {detecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LocateFixed className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {detecting
                      ? "Detecting your location…"
                      : "Use Current Location"}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {permissionHint
                      ? permissionHint
                      : detectedFormatted ||
                        (currentSelected && selectedLocation
                          ? selectedLocation.label
                          : "Use your current location")}
                  </span>
                </span>
                {currentSelected ? (
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent-blue" />
                ) : null}
              </button>
              {currentSelected && selectedLocation ? (
                <div className="mt-2 flex gap-2 pl-12">
                  <button
                    type="button"
                    onClick={handleSaveCurrentAsAddress}
                    className="rounded-lg border border-accent-blue px-2.5 py-1 text-[11px] font-semibold text-accent-blue disabled:opacity-60"
                  >
                    Save address
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-400">
                  Saved Addresses
                </p>
                <button
                  type="button"
                  className="text-[12px] font-semibold text-accent-blue"
                  onClick={openNewAddress}
                >
                  + Add new
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center">
                  <p className="text-sm text-slate-500">
                    No saved delivery addresses.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 h-8 rounded-lg"
                    onClick={openNewAddress}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {addresses.map((address) => {
                    const selected = address.id === selectedAddressId;
                    const rowBadge = deliveryLocationBadge(
                      toDeliveryLocation(address),
                      address,
                    );
                    return (
                      <li key={address.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectSaved(address)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                            selected
                              ? "border-accent-blue bg-accent-blue/5 ring-1 ring-accent-blue/20"
                              : "border-slate-200 bg-white hover:border-slate-300",
                          )}
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "truncate text-sm font-semibold",
                                  selected
                                    ? "text-accent-blue"
                                    : "text-slate-900",
                                )}
                              >
                                {address.label || address.city}
                              </span>
                              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                                {rowBadge}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                              {addressSubtitle(address)}
                            </span>
                          </span>
                          {selected ? (
                            <Check className="mt-1 h-4 w-4 shrink-0 text-accent-blue" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {lastError && addresses.length === 0 ? (
              <p className="text-[11px] text-amber-700">{lastError}</p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-xl border-dashed border-accent-blue text-accent-blue"
              onClick={openNewAddress}
            >
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddAddressDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        prefill={prefill}
        onCreated={(address) => {
          selectSavedAddress(address);
          void refreshAddresses();
        }}
      />
    </>
  );
}
