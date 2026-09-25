"use client";

import { useCallback, useState } from "react";
import {
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AddAddressDialog } from "@/components/checkout/dialogs";
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressKindLabel, formatDeliveryLabel } from "@/constants/locations";
import { useDeliveryLocation } from "@/hooks/use-delivery-location";
import { checkoutErrorMessage } from "@/services/checkout";
import type { CheckoutAddress } from "@/services/checkout";
import { cn } from "@/lib/utils";

/**
 * Production saved-address manager for Profile — same org addresses as
 * checkout, header location selector, and the Customer APP.
 */
export function SavedAddressesSection() {
  const {
    addresses,
    selectedAddressId,
    isSyncing,
    lastError,
    refreshAddresses,
    createAddress,
    updateAddress,
    removeAddress,
    makeDefault,
    selectSavedAddress,
  } = useDeliveryLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CheckoutAddress | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CheckoutAddress | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((address: CheckoutAddress) => {
    setEditing(address);
    setDialogOpen(true);
  }, []);

  const handleMakeDefault = useCallback(
    async (address: CheckoutAddress) => {
      setBusyId(address.id);
      try {
        await makeDefault(address.id);
        toast.success(`${address.label || address.city} set as primary`);
      } catch (cause) {
        toast.error(
          checkoutErrorMessage(cause, "Unable to set primary address"),
        );
      } finally {
        setBusyId(null);
      }
    },
    [makeDefault],
  );

  const handleDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    setBusyId(target.id);
    try {
      await removeAddress(target.id);
      toast.success("Address removed");
    } catch (cause) {
      toast.error(checkoutErrorMessage(cause, "Unable to remove address"));
    } finally {
      setBusyId(null);
    }
  }, [pendingDelete, removeAddress]);

  return (
    <section
      id="addresses"
      className="space-y-3 border-t border-slate-100 pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Saved Addresses
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {addresses.length === 0
              ? "Used for checkout, freight, and delivery location"
              : `${addresses.length} saved ${addresses.length === 1 ? "location" : "locations"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-slate-500"
            disabled={isSyncing}
            onClick={() => void refreshAddresses()}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh addresses</span>
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl bg-brand hover:bg-brand-700"
            onClick={openAdd}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add address
          </Button>
        </div>
      </div>

      {lastError ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {lastError}
        </p>
      ) : null}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
            <MapPin className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No delivery addresses yet
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Add a warehouse or office so checkout and freight use the right
            destination — synced with the Customer APP.
          </p>
          <Button
            type="button"
            className="mt-4 h-10 rounded-xl bg-brand hover:bg-brand-700"
            onClick={openAdd}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {addresses.map((address) => {
            const selected =
              address.id === selectedAddressId || address.isDefault;
            const busy = busyId === address.id;
            return (
              <li
                key={address.id}
                className={cn(
                  "rounded-xl border bg-white px-4 py-3.5 transition",
                  address.isDefault
                    ? "border-brand/30 shadow-sm shadow-brand/5"
                    : "border-slate-100",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {address.label || address.city}
                      </p>
                      {address.isDefault ? (
                        <Badge
                          variant="success"
                          className="rounded-md border border-emerald-100 font-medium"
                        >
                          Primary
                        </Badge>
                      ) : null}
                      {selected && !address.isDefault ? (
                        <Badge
                          variant="info"
                          className="rounded-md border border-sky-100 font-medium"
                        >
                          Selected
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {addressKindLabel(address.type)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatDeliveryLabel({
                        city: address.city,
                        state: address.state,
                        pincode: address.postalCode,
                      })}
                    </p>
                    {address.landmark ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Near {address.landmark}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-50 pt-3">
                  {!address.isDefault ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs text-brand hover:bg-brand/5 hover:text-brand"
                      disabled={busy}
                      onClick={() => void handleMakeDefault(address)}
                    >
                      {busy ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Star className="mr-1 h-3.5 w-3.5" />
                      )}
                      Set primary
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg px-2 text-xs text-slate-600 hover:bg-slate-50"
                    disabled={busy}
                    onClick={() => {
                      selectSavedAddress(address);
                      toast.success(`Delivering to ${address.city}`);
                    }}
                  >
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    Use for delivery
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg px-2 text-xs text-slate-600 hover:bg-slate-50"
                    disabled={busy}
                    onClick={() => openEdit(address)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={busy}
                    onClick={() => setPendingDelete(address)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddAddressDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        initial={editing}
        saveAddress={async (payload) => {
          if (editing?.id) {
            return updateAddress(editing.id, payload);
          }
          return createAddress({
            ...payload,
            isDefault: addresses.length === 0,
          });
        }}
      />

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Remove address?"
        description={
          pendingDelete
            ? `Delete ${pendingDelete.label || pendingDelete.city}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
