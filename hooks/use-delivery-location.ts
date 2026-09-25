"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatDeliveryLabel,
  isPersistedAddressId,
} from "@/constants/locations";
import { lookupPincode } from "@/services/location";
import { useAuthStore } from "@/store/authStore";
import {
  selectDeliveryDetecting,
  selectDeliveryLocation,
  selectSavedDeliveryAddresses,
  useDeliveryLocationStore,
} from "@/store/deliveryLocationStore";

/**
 * Single source of truth for delivery location — parity with Customer APP
 * `useDeliveryLocation`, adapted for browser GPS + Zustand persist.
 */
export function useDeliveryLocation() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [authHydrated, setAuthHydrated] = useState(() =>
    typeof window === "undefined" ? false : useAuthStore.persist.hasHydrated(),
  );

  const selected = useDeliveryLocationStore(selectDeliveryLocation);
  const addresses = useDeliveryLocationStore(selectSavedDeliveryAddresses);
  const detecting = useDeliveryLocationStore(selectDeliveryDetecting);
  const selectedAddressId = useDeliveryLocationStore(
    (state) => state.selectedAddressId,
  );
  const isHydrated = useDeliveryLocationStore((state) => state.isHydrated);
  const isSyncing = useDeliveryLocationStore((state) => state.isSyncing);
  const lastError = useDeliveryLocationStore((state) => state.lastError);

  const fetchRemote = useDeliveryLocationStore((state) => state.fetchRemote);
  const setOwnerUserId = useDeliveryLocationStore(
    (state) => state.setOwnerUserId,
  );
  const selectSavedAddress = useDeliveryLocationStore(
    (state) => state.selectSavedAddress,
  );
  const selectLocation = useDeliveryLocationStore(
    (state) => state.selectLocation,
  );
  const applyResolvedLocation = useDeliveryLocationStore(
    (state) => state.applyResolvedLocation,
  );
  const createAddress = useDeliveryLocationStore(
    (state) => state.createAddress,
  );
  const updateAddress = useDeliveryLocationStore(
    (state) => state.updateAddress,
  );
  const removeAddress = useDeliveryLocationStore(
    (state) => state.removeAddress,
  );
  const makeDefault = useDeliveryLocationStore((state) => state.makeDefault);
  const setDetecting = useDeliveryLocationStore((state) => state.setDetecting);
  const setLastError = useDeliveryLocationStore((state) => state.setLastError);
  const clearForLogout = useDeliveryLocationStore(
    (state) => state.clearForLogout,
  );

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !authHydrated) return;
    if (!isAuthenticated || !userId) {
      clearForLogout();
      return;
    }
    setOwnerUserId(userId);
    void fetchRemote();
  }, [
    authHydrated,
    clearForLogout,
    fetchRemote,
    isAuthenticated,
    isHydrated,
    setOwnerUserId,
    userId,
  ]);

  const shippingAddressId = isPersistedAddressId(
    selected?.addressId ?? selectedAddressId,
  )
    ? (selected?.addressId ?? selectedAddressId)!
    : undefined;

  const refreshAddresses = useCallback(() => fetchRemote(), [fetchRemote]);

  // Prefer English place names for cached GPS selections (e.g. কল্যাণী → Kalyani).
  useEffect(() => {
    if (!isHydrated || !authHydrated || !selected) return;
    if (selected.source !== "gps" && selected.source !== "pincode") return;
    const city = selected.city?.trim() ?? "";
    const pin = (selected.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (!city || !pin || pin.length !== 6) return;
    if (/^[\p{Script=Latin}\d\s.'’\-()/]+$/u.test(city)) return;

    let cancelled = false;
    void (async () => {
      const hits = await lookupPincode(pin);
      const first = hits[0];
      if (cancelled || !first?.city) return;
      const nextCity = first.city;
      const nextState = first.state || selected.state;
      selectLocation({
        ...selected,
        city: nextCity,
        state: nextState,
        label: formatDeliveryLabel({
          city: nextCity,
          state: nextState,
          pincode: pin,
          area: selected.landmark ?? undefined,
        }),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isHydrated, selectLocation, selected]);

  return {
    selectedLocation: selected,
    addresses,
    selectedAddressId,
    detecting,
    isSyncing,
    lastError,
    isHydrated: isHydrated && authHydrated,
    shippingAddressId,
    selectSavedAddress,
    selectLocation,
    applyResolvedLocation,
    createAddress,
    updateAddress,
    removeAddress,
    makeDefault,
    setDetecting,
    setLastError,
    refreshAddresses,
    clearForLogout,
  };
}
