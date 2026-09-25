"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DELIVERY_LOCATION_STORAGE_KEY,
  GPS_LOCATION_ID,
  deliveryLocationBadge,
  formatDeliveryLabel,
  isPersistedAddressId,
  PINCODE_REGEX,
} from "@/constants/locations";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@/services/addresses";
import type { ResolvedGeoAddress } from "@/services/location";
import type { CheckoutAddress } from "@/services/checkout";
import type { DeliveryLocation } from "@/types/delivery-location";

type DeliveryLocationState = {
  addresses: CheckoutAddress[];
  selected: DeliveryLocation | null;
  selectedAddressId: string | null;
  isHydrated: boolean;
  isSyncing: boolean;
  detecting: boolean;
  lastError: string | null;
  /** Scoped to authenticated user — cleared on logout / user switch. */
  ownerUserId: string | null;
};

type DeliveryLocationActions = {
  setHydrated: (value: boolean) => void;
  setOwnerUserId: (userId: string | null) => void;
  fetchRemote: () => Promise<CheckoutAddress[]>;
  selectSavedAddress: (address: CheckoutAddress) => void;
  selectLocation: (location: DeliveryLocation) => void;
  applyResolvedLocation: (
    resolved: ResolvedGeoAddress,
    options?: { persistAddress?: boolean },
  ) => Promise<DeliveryLocation>;
  createAddress: (input: CreateAddressInput) => Promise<CheckoutAddress>;
  updateAddress: (
    id: string,
    input: UpdateAddressInput,
  ) => Promise<CheckoutAddress>;
  removeAddress: (id: string) => Promise<void>;
  makeDefault: (id: string) => Promise<CheckoutAddress>;
  setDetecting: (value: boolean) => void;
  setLastError: (message: string | null) => void;
  clearForLogout: () => void;
  shippingAddressId: () => string | undefined;
};

export type DeliveryLocationStore = DeliveryLocationState &
  DeliveryLocationActions;

export function toDeliveryLocation(address: CheckoutAddress): DeliveryLocation {
  const location: DeliveryLocation = {
    id: address.id,
    city: address.city,
    state: address.state,
    pincode: address.postalCode,
    label: formatDeliveryLabel({
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
      area: address.landmark ?? undefined,
    }),
    source: "saved",
    addressId: address.id,
    line1: address.line1,
    line2: address.line2,
    landmark: address.landmark,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
  };
  location.badge = deliveryLocationBadge(location, address);
  return location;
}

export function resolvedToDeliveryLocation(
  resolved: ResolvedGeoAddress,
): DeliveryLocation {
  const location: DeliveryLocation = {
    id: GPS_LOCATION_ID,
    city: resolved.city,
    state: resolved.state,
    pincode: resolved.postalCode,
    label: formatDeliveryLabel({
      city: resolved.city,
      state: resolved.state,
      pincode: resolved.postalCode,
      area: resolved.landmark ?? resolved.label,
    }),
    source: resolved.source === "pincode" ? "pincode" : "gps",
    addressId: null,
    line1: resolved.line1,
    line2: resolved.line2 ?? null,
    landmark: resolved.landmark ?? null,
    latitude: resolved.latitude || null,
    longitude: resolved.longitude || null,
    badge: "CURRENT",
  };
  return location;
}

function pickSelection(
  remote: CheckoutAddress[],
  currentId: string | null,
  current: DeliveryLocation | null,
): { selectedAddressId: string | null; selected: DeliveryLocation | null } {
  const stillOnServer = Boolean(
    currentId && remote.some((row) => row.id === currentId),
  );
  const keepEphemeral = Boolean(
    currentId &&
    !isPersistedAddressId(currentId) &&
    current &&
    (current.source === "gps" || current.source === "pincode"),
  );

  if (stillOnServer && currentId) {
    const row = remote.find((entry) => entry.id === currentId)!;
    return { selectedAddressId: currentId, selected: toDeliveryLocation(row) };
  }

  if (keepEphemeral && current) {
    return { selectedAddressId: currentId, selected: current };
  }

  const fallback = remote.find((row) => row.isDefault) ?? remote[0] ?? null;
  if (!fallback) {
    return { selectedAddressId: null, selected: null };
  }
  return {
    selectedAddressId: fallback.id,
    selected: toDeliveryLocation(fallback),
  };
}

const initialState: DeliveryLocationState = {
  addresses: [],
  selected: null,
  selectedAddressId: null,
  isHydrated: false,
  isSyncing: false,
  detecting: false,
  lastError: null,
  ownerUserId: null,
};

export const useDeliveryLocationStore = create<DeliveryLocationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHydrated: (value) => set({ isHydrated: value }),

      setOwnerUserId: (userId) => {
        const previous = get().ownerUserId;
        if (previous && userId && previous !== userId) {
          set({
            ...initialState,
            ownerUserId: userId,
            isHydrated: true,
          });
          return;
        }
        set({ ownerUserId: userId });
      },

      fetchRemote: async () => {
        set({ isSyncing: true, lastError: null });
        try {
          const remote = await fetchCustomerAddresses();
          const next = pickSelection(
            remote,
            get().selectedAddressId,
            get().selected,
          );
          set({
            addresses: remote,
            selectedAddressId: next.selectedAddressId,
            selected: next.selected,
            isSyncing: false,
          });
          return remote;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load saved addresses. Please try again.";
          set({ isSyncing: false, lastError: message });
          return get().addresses;
        }
      },

      selectSavedAddress: (address) => {
        const location = toDeliveryLocation(address);
        const addresses = [
          address,
          ...get().addresses.filter((row) => row.id !== address.id),
        ];
        set({
          addresses,
          selected: location,
          selectedAddressId: address.id,
          lastError: null,
        });
      },

      selectLocation: (location) => {
        set({
          selected: {
            ...location,
            badge:
              location.badge ??
              deliveryLocationBadge(
                location,
                get().addresses.find((row) => row.id === location.addressId),
              ),
          },
          selectedAddressId: location.addressId ?? location.id,
          lastError: null,
        });
      },

      applyResolvedLocation: async (resolved, options) => {
        const persistAddress = options?.persistAddress ?? false;
        if (
          persistAddress &&
          PINCODE_REGEX.test(resolved.postalCode) &&
          resolved.line1.trim()
        ) {
          const saved = await get().createAddress({
            type: "SHIPPING",
            label: resolved.label || resolved.landmark || "Current location",
            line1:
              resolved.line1 ||
              formatDeliveryLabel({
                city: resolved.city,
                state: resolved.state,
                pincode: resolved.postalCode,
              }),
            line2: resolved.line2,
            city: resolved.city,
            state: resolved.state,
            postalCode: resolved.postalCode,
            landmark: resolved.landmark,
            latitude: resolved.latitude || null,
            longitude: resolved.longitude || null,
            isDefault: get().addresses.length === 0,
          });
          return toDeliveryLocation(saved);
        }

        const location = resolvedToDeliveryLocation(resolved);
        get().selectLocation(location);
        return location;
      },

      createAddress: async (input) => {
        const created = await createCustomerAddress(input);
        const addresses = [
          created,
          ...get()
            .addresses.filter((row) => row.id !== created.id)
            .map((row) =>
              created.isDefault ? { ...row, isDefault: false } : row,
            ),
        ];
        const location = toDeliveryLocation(created);
        set({
          addresses,
          selected: location,
          selectedAddressId: created.id,
          lastError: null,
        });
        return created;
      },

      updateAddress: async (id, input) => {
        const updated = await updateCustomerAddress(id, input);
        const addresses = get().addresses.map((row) => {
          if (row.id === updated.id) return updated;
          return updated.isDefault ? { ...row, isDefault: false } : row;
        });
        const selectedId = get().selectedAddressId;
        set({
          addresses,
          lastError: null,
          ...(selectedId === updated.id
            ? {
                selected: toDeliveryLocation(updated),
                selectedAddressId: updated.id,
              }
            : {}),
        });
        return updated;
      },

      removeAddress: async (id) => {
        await deleteCustomerAddress(id);
        const addresses = get().addresses.filter((row) => row.id !== id);
        const wasSelected = get().selectedAddressId === id;
        const nextId = wasSelected
          ? (addresses.find((row) => row.isDefault)?.id ??
            addresses[0]?.id ??
            null)
          : get().selectedAddressId;
        const nextRow = nextId
          ? (addresses.find((row) => row.id === nextId) ?? null)
          : null;
        set({
          addresses,
          selectedAddressId: nextId,
          selected: nextRow
            ? toDeliveryLocation(nextRow)
            : wasSelected
              ? null
              : get().selected,
          lastError: null,
        });
      },

      makeDefault: async (id) => {
        const updated = await setDefaultCustomerAddress(id);
        const addresses = get().addresses.map((row) => ({
          ...row,
          isDefault: row.id === updated.id,
        }));
        set({
          addresses,
          selected: toDeliveryLocation(updated),
          selectedAddressId: updated.id,
          lastError: null,
        });
        return updated;
      },

      setDetecting: (value) => set({ detecting: value }),

      setLastError: (message) => set({ lastError: message }),

      clearForLogout: () => set({ ...initialState, isHydrated: true }),

      shippingAddressId: () => {
        const { selected, selectedAddressId } = get();
        const id = selected?.addressId ?? selectedAddressId;
        return isPersistedAddressId(id) ? id! : undefined;
      },
    }),
    {
      name: DELIVERY_LOCATION_STORAGE_KEY,
      partialize: (state) => ({
        // Persist selection reference + safe display fields only (no raw GPS dump).
        selectedAddressId: state.selectedAddressId,
        ownerUserId: state.ownerUserId,
        selected: state.selected
          ? {
              id: state.selected.id,
              city: state.selected.city,
              state: state.selected.state,
              pincode: state.selected.pincode,
              label: state.selected.label,
              source: state.selected.source,
              addressId: state.selected.addressId ?? null,
              line1: state.selected.line1,
              line2: state.selected.line2 ?? null,
              landmark: state.selected.landmark ?? null,
              badge: state.selected.badge,
              // Drop precise coords from long-lived storage for GPS selections.
              latitude:
                state.selected.source === "saved"
                  ? (state.selected.latitude ?? null)
                  : null,
              longitude:
                state.selected.source === "saved"
                  ? (state.selected.longitude ?? null)
                  : null,
            }
          : null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectDeliveryLocation = (state: DeliveryLocationStore) =>
  state.selected;
export const selectSavedDeliveryAddresses = (state: DeliveryLocationStore) =>
  state.addresses;
export const selectDeliveryDetecting = (state: DeliveryLocationStore) =>
  state.detecting;
