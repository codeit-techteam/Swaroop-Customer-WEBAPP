"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  LocateFixed,
  MapPin,
  PencilLine,
} from "lucide-react";
import { toast } from "sonner";
import { INDIAN_PINCODE_REGEX } from "@/components/checkout/constants";
import { AddressAutocomplete } from "@/components/location/address-autocomplete";
import {
  isMapPickerAvailable,
  LocationMapPicker,
} from "@/components/location/location-map-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createCustomerAddress,
  updateCustomerAddress,
  type CreateAddressInput,
} from "@/services/addresses";
import type { CheckoutAddress } from "@/services/checkout";
import { checkoutErrorMessage } from "@/services/checkout";
import {
  CURRENT_LOCATION_PHASE_LABELS,
  type CurrentLocationPhase,
  fetchCurrentDeliveryAddress,
  LocationAccessError,
  lookupPincode,
  normalizedToResolved,
  reverseGeocodeCoords,
  type ResolvedGeoAddress,
} from "@/services/location";
import {
  fetchLocationConfig,
  isLocationServiceDown,
  LOW_ACCURACY_THRESHOLD_METERS,
  type AddressCaptureSource,
  type LocationServiceError,
  type NormalizedLocation,
} from "@/services/location-search";
import { useDeliveryLocationStore } from "@/store/deliveryLocationStore";

/** GPS fixes this coarse are never stored unless the user places the pin. */
const UNUSABLE_ACCURACY_METERS = 1000;
/** Ignore map settles closer than this to the current pin. */
const PIN_MOVE_THRESHOLD_METERS = 8;

const EMPTY_FORM = {
  label: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  postalCode: "",
};

type FormState = typeof EMPTY_FORM;
type FormKey = keyof FormState;

type GeoState = {
  latitude: number;
  longitude: number;
  placeId: string | null;
  formattedAddress: string;
  locality: string;
  accuracyMeters: number | null;
  source: AddressCaptureSource;
};

export type AddressDialogPayload = CreateAddressInput & {
  label: string;
  type: "SHIPPING";
};

function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function resolvedToForm(resolved: ResolvedGeoAddress): FormState {
  return {
    label: resolved.label ?? "",
    line1: resolved.line1 ?? "",
    line2: resolved.line2 ?? "",
    landmark: resolved.landmark ?? "",
    city: resolved.city ?? "",
    district: resolved.district ?? "",
    state: resolved.state ?? "",
    postalCode: (resolved.postalCode ?? "").replace(/\D/g, "").slice(0, 6),
  };
}

function resolvedToGeo(resolved: ResolvedGeoAddress): GeoState | null {
  const hasCoords =
    Number.isFinite(resolved.latitude) &&
    Number.isFinite(resolved.longitude) &&
    !(resolved.latitude === 0 && resolved.longitude === 0);
  if (!hasCoords) return null;
  return {
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    placeId: resolved.placeId ?? null,
    formattedAddress: resolved.formattedAddress ?? "",
    locality: resolved.locality ?? "",
    accuracyMeters: resolved.accuracyMeters ?? null,
    source:
      resolved.captureSource ??
      (resolved.source === "pincode" ? "PINCODE" : "GPS"),
  };
}

function addressToGeo(address: CheckoutAddress): GeoState | null {
  if (address.latitude == null || address.longitude == null) return null;
  const source = (address.source ?? "MANUAL").toUpperCase();
  return {
    latitude: address.latitude,
    longitude: address.longitude,
    placeId: address.placeId ?? null,
    formattedAddress: address.formattedAddress ?? "",
    locality: address.locality ?? "",
    accuracyMeters: address.accuracyMeters ?? null,
    source: (["AUTOCOMPLETE", "GPS", "MAP_PIN", "PINCODE", "MANUAL"].includes(
      source,
    )
      ? source
      : "MANUAL") as AddressCaptureSource,
  };
}

/**
 * Add / edit a delivery address. New addresses start from a search or the
 * device location; the form only appears once a location is picked so every
 * saved address carries verified coordinates wherever possible.
 */
export function AddAddressDialog({
  open,
  onOpenChange,
  onCreated,
  onSaved,
  initial,
  prefill,
  saveAddress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** @deprecated Prefer onSaved — kept for checkout / location selector callers. */
  onCreated?: (address: CheckoutAddress) => void;
  onSaved?: (address: CheckoutAddress) => void;
  initial?: CheckoutAddress | null;
  /** Opens straight on the confirm step (e.g. a GPS fix from the header). */
  prefill?: ResolvedGeoAddress | null;
  /** Prefer store-backed saves (create/update) when managing profile addresses. */
  saveAddress?: (input: AddressDialogPayload) => Promise<CheckoutAddress>;
}) {
  const isEdit = Boolean(initial?.id);
  const nearLat = useDeliveryLocationStore((s) => s.selected?.latitude);
  const nearLng = useDeliveryLocationStore((s) => s.selected?.longitude);
  const nearPoint = useMemo(
    () =>
      nearLat != null && nearLng != null
        ? { latitude: nearLat, longitude: nearLng }
        : null,
    [nearLat, nearLng],
  );

  const [step, setStep] = useState<"search" | "confirm">("search");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [geo, setGeo] = useState<GeoState | null>(null);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gpsPhase, setGpsPhase] = useState<CurrentLocationPhase | null>(null);
  const detecting = gpsPhase != null;
  const [lookingUpPin, setLookingUpPin] = useState(false);
  const [refreshingPin, setRefreshingPin] = useState(false);
  const touchedRef = useRef(new Set<FormKey>());
  const pinRequestRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setStep("search");
      setForm(EMPTY_FORM);
      setGeo(null);
      setSearchNotice(null);
      setGpsPhase(null);
      setLookingUpPin(false);
      setRefreshingPin(false);
      touchedRef.current.clear();
      pinRequestRef.current += 1;
      return;
    }
    touchedRef.current.clear();
    if (initial) {
      setForm({
        label: initial.label ?? "",
        line1: initial.line1 ?? "",
        line2: initial.line2 ?? "",
        landmark: initial.landmark ?? "",
        city: initial.city ?? "",
        district: initial.district ?? "",
        state: initial.state ?? "",
        postalCode: initial.postalCode ?? "",
      });
      setGeo(addressToGeo(initial));
      setStep("confirm");
    } else if (prefill) {
      setForm(resolvedToForm(prefill));
      setGeo(resolvedToGeo(prefill));
      setStep("confirm");
    } else {
      setForm(EMPTY_FORM);
      setGeo(null);
      setStep("search");
    }
  }, [open, initial, prefill]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void fetchLocationConfig().then((config) => {
      if (!active) return;
      setSearchEnabled(config.autocompleteEnabled);
      setSearchNotice(
        config.autocompleteEnabled
          ? null
          : "Address search is unavailable right now. Use your current location or enter the address manually.",
      );
    });
    return () => {
      active = false;
    };
  }, [open]);

  function setField(key: FormKey, value: string) {
    touchedRef.current.add(key);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Apply a freshly resolved location without clobbering fields the user typed. */
  const applyResolved = useCallback(
    (resolved: ResolvedGeoAddress, mode: "replace" | "merge") => {
      const next = resolvedToForm(resolved);
      setForm((prev) => {
        if (mode === "replace") return next;
        const merged = { ...prev };
        (Object.keys(next) as FormKey[]).forEach((key) => {
          if (!touchedRef.current.has(key) || !prev[key].trim()) {
            merged[key] = next[key] || prev[key];
          }
        });
        return merged;
      });
      setGeo(resolvedToGeo(resolved));
    },
    [],
  );

  function handlePlaceSelected(location: NormalizedLocation) {
    touchedRef.current.clear();
    applyResolved(normalizedToResolved(location), "replace");
    setStep("confirm");
  }

  const handleSearchError = useCallback((error: LocationServiceError) => {
    if (isLocationServiceDown(error)) {
      setSearchEnabled(false);
      setSearchNotice(error.message);
    }
  }, []);

  async function handleUseCurrentLocation() {
    setGpsPhase("locating");
    try {
      const resolved = await fetchCurrentDeliveryAddress(setGpsPhase);
      touchedRef.current.clear();
      applyResolved(resolved, "replace");
      setStep("confirm");
    } catch (cause) {
      toast.error(
        cause instanceof LocationAccessError
          ? cause.message
          : "Unable to fetch your current location. Search for your address instead.",
      );
    } finally {
      setGpsPhase(null);
    }
  }

  async function handlePinAdjusted(latitude: number, longitude: number) {
    if (
      geo &&
      distanceMeters(geo, { latitude, longitude }) < PIN_MOVE_THRESHOLD_METERS
    ) {
      return;
    }
    const requestId = ++pinRequestRef.current;
    setGeo((prev) =>
      prev
        ? {
            ...prev,
            latitude,
            longitude,
            accuracyMeters: null,
            source: "MAP_PIN",
          }
        : prev,
    );
    setRefreshingPin(true);
    try {
      const resolved = await reverseGeocodeCoords(
        latitude,
        longitude,
        "MAP_PIN",
      );
      if (requestId !== pinRequestRef.current) return;
      applyResolved(
        { ...resolved, latitude, longitude, captureSource: "MAP_PIN" },
        "merge",
      );
    } catch {
      if (requestId === pinRequestRef.current) {
        toast.message(
          "Pin moved. We couldn't refresh the address — check the fields below.",
        );
      }
    } finally {
      if (requestId === pinRequestRef.current) setRefreshingPin(false);
    }
  }

  async function handlePostalCodeChange(value: string) {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    setField("postalCode", pin);
    if (!INDIAN_PINCODE_REGEX.test(pin)) return;

    setLookingUpPin(true);
    try {
      const first = (await lookupPincode(pin))[0];
      if (!first) return;
      setForm((prev) => ({
        ...prev,
        postalCode: pin,
        city: prev.city.trim() || first.city,
        state: prev.state.trim() || first.state,
        line2: prev.line2.trim() || first.name,
      }));
    } finally {
      setLookingUpPin(false);
    }
  }

  function startManualEntry() {
    touchedRef.current.clear();
    setForm(EMPTY_FORM);
    setGeo(null);
    setStep("confirm");
  }

  const lowAccuracy =
    geo?.source === "GPS" &&
    geo.accuracyMeters != null &&
    geo.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;
  const coordsUnusable =
    lowAccuracy && (geo?.accuracyMeters ?? 0) > UNUSABLE_ACCURACY_METERS;
  const showMap = Boolean(geo) && isMapPickerAvailable();

  async function handleSave() {
    if (saving) return;
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error("Fill in address line 1, city and state");
      return;
    }
    if (!INDIAN_PINCODE_REGEX.test(form.postalCode.trim())) {
      toast.error("Enter a valid 6-digit Indian PIN code");
      return;
    }
    const savedGeo = geo && !coordsUnusable ? geo : null;
    setSaving(true);
    try {
      const payload: AddressDialogPayload = {
        label: form.label.trim() || form.line2.trim() || form.city.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        city: form.city.trim(),
        district: form.district.trim() || undefined,
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: "IN",
        latitude: savedGeo?.latitude,
        longitude: savedGeo?.longitude,
        locality: geo?.locality || undefined,
        placeId: savedGeo?.placeId,
        formattedAddress: geo?.formattedAddress || undefined,
        accuracyMeters: savedGeo?.accuracyMeters,
        source: savedGeo?.source ?? "MANUAL",
        type: "SHIPPING",
      };
      const address = saveAddress
        ? await saveAddress(payload)
        : isEdit && initial
          ? await updateCustomerAddress(initial.id, payload)
          : await createCustomerAddress(payload);
      onSaved?.(address);
      onCreated?.(address);
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

  const summaryTitle =
    form.label.trim() ||
    geo?.locality ||
    form.line2.trim() ||
    form.city.trim() ||
    "Selected location";
  const summaryText =
    geo?.formattedAddress ||
    [form.line1, form.line2, form.city, form.state, form.postalCode]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit delivery address"
              : step === "search"
                ? "Add delivery address"
                : "Confirm delivery location"}
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Search your delivery location or use where you are right now."
              : "Saved to your PetroTrade organization for checkout and freight — shared with the Customer APP for the same login."}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4">
            {searchEnabled ? (
              <AddressAutocomplete
                autoFocus
                near={nearPoint}
                onSelect={handlePlaceSelected}
                onError={handleSearchError}
                disabled={saving || detecting}
              />
            ) : null}
            {searchNotice ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {searchNotice}
              </p>
            ) : null}

            {searchEnabled ? (
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            ) : null}

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
              <span className="min-w-0 flex-1 text-sm font-semibold text-accent-blue">
                {gpsPhase
                  ? CURRENT_LOCATION_PHASE_LABELS[gpsPhase]
                  : "Use current location"}
              </span>
            </button>

            <button
              type="button"
              onClick={startManualEntry}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <PencilLine className="h-3.5 w-3.5" />
              Enter address manually
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {geo ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  {refreshingPin ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {summaryTitle}
                  </span>
                  {summaryText ? (
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                      {summaryText}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => setStep("search")}
                  className="shrink-0 text-xs font-semibold text-accent-blue"
                >
                  Change
                </button>
              </div>
            ) : null}

            {searchEnabled ? (
              <div className="space-y-1.5">
                <Label>Search delivery location</Label>
                <AddressAutocomplete
                  autoFocus={!geo}
                  near={nearPoint}
                  placeholder="Search area, building, landmark or PIN"
                  onSelect={handlePlaceSelected}
                  onError={handleSearchError}
                  disabled={saving || detecting}
                />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Type a place name. Pick a Google suggestion to fill city,
                  district, state and PIN. You can still edit every field.
                </p>
              </div>
            ) : searchNotice ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {searchNotice}
              </p>
            ) : null}

            {!geo ? (
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
                <span className="min-w-0 flex-1 text-sm font-semibold text-accent-blue">
                  {gpsPhase
                    ? CURRENT_LOCATION_PHASE_LABELS[gpsPhase]
                    : "Use current location"}
                </span>
              </button>
            ) : null}

            {showMap && geo ? (
              <LocationMapPicker
                latitude={geo.latitude}
                longitude={geo.longitude}
                accuracyMeters={
                  geo.source === "GPS" ? geo.accuracyMeters : null
                }
                onAdjust={(lat, lng) => void handlePinAdjusted(lat, lng)}
              />
            ) : null}

            {lowAccuracy ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Your location is only accurate to about{" "}
                  {Math.round(geo?.accuracyMeters ?? 0)} m.{" "}
                  {showMap
                    ? "Move the map so the pin sits on your exact delivery point, or search for the address."
                    : "Check the address below carefully or search for it instead."}
                  {coordsUnusable
                    ? " This position is too imprecise to store unless you adjust the pin."
                    : null}
                </span>
              </div>
            ) : null}

            <div className="grid gap-3">
              <AddressField
                label="Save as"
                hint="Optional nickname, e.g. Main plant"
                value={form.label}
                onChange={(value) => setField("label", value)}
              />
              <AddressField
                label="Address line 1"
                hint="Building, plot, street"
                value={form.line1}
                onChange={(value) => setField("line1", value)}
                required
              />
              <AddressField
                label="Address line 2 (optional)"
                hint="Area, locality"
                value={form.line2}
                onChange={(value) => setField("line2", value)}
              />
              <AddressField
                label="Landmark (optional)"
                value={form.landmark}
                onChange={(value) => setField("landmark", value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <AddressField
                  label="City"
                  value={form.city}
                  onChange={(value) => setField("city", value)}
                  required
                />
                <AddressField
                  label="District (optional)"
                  value={form.district}
                  onChange={(value) => setField("district", value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AddressField
                  label="State"
                  value={form.state}
                  onChange={(value) => setField("state", value)}
                  required
                />
                <AddressField
                  label="PIN code"
                  status={lookingUpPin ? "Looking up…" : undefined}
                  value={form.postalCode}
                  onChange={(value) => void handlePostalCodeChange(value)}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  invalid={
                    form.postalCode.length > 0 &&
                    !INDIAN_PINCODE_REGEX.test(form.postalCode)
                  }
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {step === "confirm" ? (
            <Button
              type="button"
              className="rounded-xl bg-brand hover:bg-brand-700"
              disabled={saving || detecting || refreshingPin}
              onClick={() => void handleSave()}
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Confirm & save"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddressField({
  label,
  hint,
  status,
  value,
  onChange,
  required,
  invalid,
  inputMode,
  maxLength,
}: {
  label: string;
  hint?: string;
  status?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {status ? (
          <span className="ml-2 text-[11px] font-normal text-slate-400">
            {status}
          </span>
        ) : null}
      </Label>
      <Input
        value={value}
        placeholder={hint}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={cn("rounded-xl", invalid && "border-red-300")}
      />
    </div>
  );
}
