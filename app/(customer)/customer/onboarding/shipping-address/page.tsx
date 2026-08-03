"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, Truck, Warehouse } from "lucide-react";
import { toast } from "sonner";
import {
  shippingAddressSchema,
  type ShippingAddressFormValues,
} from "@/lib/onboarding-schemas";
import { ONBOARDING_ROUTES } from "@/constants/onboarding";
import {
  useOnboardingStore,
  completeShippingStep,
} from "@/store/onboardingStore";
import {
  OnboardingLayout,
  RouteGuard,
  StepHeader,
  BackButton,
  SaveDraftButton,
  ContinueButton,
} from "@/components/onboarding";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ShippingAddress } from "@/types/onboarding";

export default function ShippingAddressPage() {
  return (
    <RouteGuard stepId="shipping-address">
      <OnboardingLayout saveDraftVariant="outline" helpVariant="support">
        <ShippingAddressContent />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function ShippingAddressContent() {
  const router = useRouter();
  const addresses = useOnboardingStore((s) => s.shippingAddresses);
  const addShipping = useOnboardingStore((s) => s.addShipping);
  const updateShipping = useOnboardingStore((s) => s.updateShipping);
  const deleteShipping = useOnboardingStore((s) => s.deleteShipping);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingAddress | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(addr: ShippingAddress) {
    setEditing(addr);
    setDialogOpen(true);
  }

  function handleSave(values: ShippingAddressFormValues) {
    if (editing) {
      updateShipping(editing.id, values);
      toast.success("Address updated");
    } else {
      addShipping(values);
      toast.success("Address added");
    }
    setDialogOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    deleteShipping(id);
    toast.success("Address removed");
  }

  function handleContinue() {
    if (addresses.length < 1) {
      toast.error("Add at least one shipping address");
      return;
    }
    completeShippingStep();
    router.push(ONBOARDING_ROUTES.creditEligibility);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <StepHeader
        stepLabel="Step 4 of 6"
        title="Shipping Terminals & Addresses"
        description="Manage your delivery locations. You can add multiple terminals for fuel and petrochemical distribution."
      />

      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 bg-slate-900"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.25) 100%), linear-gradient(135deg, #1e293b, #334155)",
          }}
          aria-hidden="true"
        />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Efficient Logistics
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Adding precise shipping addresses ensures faster turnaround times at
            refinery gates and automated weighbridge clearance.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">
          Active Terminals ({addresses.length})
        </h2>
        <Button
          type="button"
          onClick={openAdd}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add New Address
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr, index) => (
          <article
            key={addr.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                {index % 2 === 0 ? (
                  <Truck className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Warehouse className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Terminal Name
                    </p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {addr.terminalName}
                    </p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contact Person
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      {addr.contactPerson}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Address
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      {addr.fullAddress}
                    </p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mobile Number
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      {addr.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(addr)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  aria-label={`Edit ${addr.terminalName}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label={`Delete ${addr.terminalName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          aria-label="Add additional delivery point"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
          <span className="text-sm font-medium">
            Add Additional Delivery Point
          </span>
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href={ONBOARDING_ROUTES.businessAddress} />
        <div className="flex items-center justify-end gap-3">
          <SaveDraftButton variant="outline" />
          <ContinueButton
            label="Continue"
            type="button"
            showArrow
            disabled={addresses.length < 1}
            onClick={handleContinue}
          />
        </div>
      </div>

      <ShippingAddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
}

function ShippingAddressDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ShippingAddress | null;
  onSave: (values: ShippingAddressFormValues) => void;
}) {
  const form = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      terminalName: "",
      fullAddress: "",
      contactPerson: "",
      mobileNumber: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      initial
        ? {
            terminalName: initial.terminalName,
            fullAddress: initial.fullAddress,
            contactPerson: initial.contactPerson,
            mobileNumber: initial.mobileNumber,
          }
        : {
            terminalName: "",
            fullAddress: "",
            contactPerson: "",
            mobileNumber: "",
          },
    );
  }, [open, initial, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Shipping Address" : "Add Shipping Address"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="terminalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Western Hub Terminal A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Plot, Industrial Zone, City, State, Pincode"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Amit Shah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 91234 56789"
                      inputMode="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                {initial ? "Save Changes" : "Add Address"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
