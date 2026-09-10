"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants";
import { formatInr, formatInrPerMt, formatQuantityMt } from "@/lib/format";
import {
  computeEstimatedFreight,
  deliveryLocationsMock,
  getCheckoutAddressById,
  getDeliveryLocationById,
  GST_RATE,
  shippingBillingAddressesMock,
} from "@/mock/checkout";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { cn } from "@/lib/utils";
import {
  checkoutCreditProfileMock,
  getCheckoutPaymentOption,
  getCreditTermLabel,
  paymentMethodSummaryLabel,
} from "@/mock/checkout-payment";
import {
  CHECKOUT_STEP_ORDER,
  CheckoutStepper,
  type CheckoutStepId,
} from "./CheckoutStepper";
import { CheckoutPaymentSelector, PaymentSummary } from "./payment";

export function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartSubtotal = useCartStore((s) => s.subtotal());

  const deliveryAllocations = useCheckoutStore((s) => s.deliveryAllocations);
  const setDeliveryAllocation = useCheckoutStore(
    (s) => s.setDeliveryAllocation,
  );
  const removeDeliveryAllocation = useCheckoutStore(
    (s) => s.removeDeliveryAllocation,
  );
  const shippingAddressId = useCheckoutStore((s) => s.shippingAddressId);
  const billingAddressId = useCheckoutStore((s) => s.billingAddressId);
  const sameAsShipping = useCheckoutStore((s) => s.sameAsShipping);
  const setShippingAddressId = useCheckoutStore((s) => s.setShippingAddressId);
  const setBillingAddressId = useCheckoutStore((s) => s.setBillingAddressId);
  const setSameAsShipping = useCheckoutStore((s) => s.setSameAsShipping);
  const gstNumber = useCheckoutStore((s) => s.gstNumber);
  const setGstNumber = useCheckoutStore((s) => s.setGstNumber);
  const remarks = useCheckoutStore((s) => s.remarks);
  const setRemarks = useCheckoutStore((s) => s.setRemarks);
  const customAddresses = useCheckoutStore((s) => s.customAddresses);
  const addCustomAddress = useCheckoutStore((s) => s.addCustomAddress);
  const generatePurchaseOrder = useCheckoutStore(
    (s) => s.generatePurchaseOrder,
  );
  const resetCheckout = useCheckoutStore((s) => s.resetCheckout);
  const activePurchaseOrder = useCheckoutStore((s) => s.activePurchaseOrder);
  const selectedPaymentMethodId = useCheckoutStore(
    (s) => s.selectedPaymentMethodId,
  );
  const setSelectedPaymentMethodId = useCheckoutStore(
    (s) => s.setSelectedPaymentMethodId,
  );
  const creditTermDays = useCheckoutStore((s) => s.creditTermDays);
  const setCreditTermDays = useCheckoutStore((s) => s.setCreditTermDays);

  const [step, setStep] = useState<CheckoutStepId>("review");
  const [addressOpen, setAddressOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    contactPerson: "",
    phone: "",
  });

  const totalOrderedQty = useMemo(
    () => items.reduce((s, i) => s + i.quantityMt, 0),
    [items],
  );
  const allocatedQty = useMemo(
    () => deliveryAllocations.reduce((s, a) => s + a.quantityMt, 0),
    [deliveryAllocations],
  );
  const remainingQty = totalOrderedQty - allocatedQty;
  const allocationValid =
    deliveryAllocations.length > 0 && allocatedQty === totalOrderedQty;

  const estimatedFreight = computeEstimatedFreight(deliveryAllocations);
  const gst = Math.round(cartSubtotal * GST_RATE);
  const grandTotal = cartSubtotal + gst + estimatedFreight;

  const deliveryOk =
    allocationValid && Boolean(shippingAddressId) && Boolean(gstNumber.trim());
  const paymentOk =
    Boolean(selectedPaymentMethodId) &&
    (selectedPaymentMethodId !== "credit" ||
      checkoutCreditProfileMock.approved);
  const stepIndex = CHECKOUT_STEP_ORDER.indexOf(step);
  const paymentLabel = selectedPaymentMethodId
    ? paymentMethodSummaryLabel(
        selectedPaymentMethodId,
        selectedPaymentMethodId === "credit" ? creditTermDays : undefined,
      )
    : null;

  const primaryDeliveryId =
    [...deliveryAllocations].sort((a, b) => b.quantityMt - a.quantityMt)[0]
      ?.locationId ?? shippingAddressId;

  useEffect(() => {
    if (items.length === 0) return;
    if (deliveryAllocations.length === 0) {
      const first = deliveryLocationsMock[0];
      if (first) setDeliveryAllocation(first.id, totalOrderedQty);
      return;
    }
    // Keep single-location allocation in sync when cart qty changes
    if (deliveryAllocations.length === 1) {
      const only = deliveryAllocations[0];
      if (only.quantityMt !== totalOrderedQty) {
        setDeliveryAllocation(only.locationId, totalOrderedQty);
      }
    }
  }, [
    items.length,
    totalOrderedQty,
    deliveryAllocations,
    setDeliveryAllocation,
  ]);

  // Delivery locations are the shipping destinations — keep store in sync
  useEffect(() => {
    if (!primaryDeliveryId) return;
    if (shippingAddressId !== primaryDeliveryId) {
      setShippingAddressId(primaryDeliveryId);
    }
    if (sameAsShipping && billingAddressId !== primaryDeliveryId) {
      setBillingAddressId(primaryDeliveryId);
    }
  }, [
    primaryDeliveryId,
    shippingAddressId,
    billingAddressId,
    sameAsShipping,
    setShippingAddressId,
    setBillingAddressId,
  ]);

  const allAddresses = [...shippingBillingAddressesMock, ...customAddresses];

  function deliveryLabel(locationId: string) {
    return (
      getDeliveryLocationById(locationId)?.name ??
      getCheckoutAddressById(locationId, customAddresses)?.label ??
      locationId
    );
  }

  function goNext() {
    if (step === "review") {
      if (items.length === 0) {
        toast.error("Add products before continuing");
        return;
      }
      setStep("delivery");
      return;
    }
    if (step === "delivery") {
      if (!allocationValid) {
        toast.error(
          `Allocate exactly ${formatQuantityMt(totalOrderedQty)} across locations`,
        );
        return;
      }
      if (!gstNumber.trim()) {
        toast.error("Enter GST number");
        return;
      }
      setStep("payment");
      return;
    }
    if (step === "payment") {
      if (!selectedPaymentMethodId) {
        toast.error("Select a payment method before continuing");
        return;
      }
      if (
        selectedPaymentMethodId === "credit" &&
        !checkoutCreditProfileMock.approved
      ) {
        toast.error(
          "Credit is not available. Apply for credit or choose another method.",
        );
        return;
      }
      setStep("confirm");
    }
  }

  function goBack() {
    const idx = CHECKOUT_STEP_ORDER.indexOf(step);
    if (idx <= 0) {
      router.push(ROUTES.cart);
      return;
    }
    setStep(CHECKOUT_STEP_ORDER[idx - 1]);
  }

  function distributeEvenly() {
    if (items.length === 0) return;
    const locs = deliveryLocationsMock;
    const base = Math.floor(totalOrderedQty / locs.length);
    let remainder = totalOrderedQty - base * locs.length;
    locs.forEach((loc) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      setDeliveryAllocation(loc.id, base + extra);
    });
    toast.success("Quantity split evenly across locations");
  }

  function assignAllTo(locationId: string) {
    const allIds = [
      ...deliveryLocationsMock.map((l) => l.id),
      ...customAddresses.map((a) => a.id),
    ];
    allIds.forEach((id) => {
      if (id === locationId) setDeliveryAllocation(id, totalOrderedQty);
      else removeDeliveryAllocation(id);
    });
  }

  function handlePlaceOrder() {
    if (!allocationValid) {
      toast.error(
        `Delivery quantities must total ${formatQuantityMt(totalOrderedQty)}`,
      );
      setStep("delivery");
      return;
    }
    if (!gstNumber.trim()) {
      toast.error("Enter GST number");
      setStep("delivery");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error(
        "Select a payment method before generating the Purchase Order",
      );
      setStep("payment");
      return;
    }
    if (
      selectedPaymentMethodId === "credit" &&
      !checkoutCreditProfileMock.approved
    ) {
      toast.error("Credit is not available for this account");
      setStep("payment");
      return;
    }
    setSubmitting(true);
    const po = generatePurchaseOrder({
      items,
      subtotal: cartSubtotal,
      gst,
      estimatedFreight,
    });
    clearCart();
    resetCheckout();
    toast.success(`Purchase Order ${po.poNumber} created`);
    router.push(`${ROUTES.purchaseRequestsSuccess}?po=${po.poNumber}`);
  }

  if (items.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Checkout"
          description="Complete delivery address details to generate a Purchase Order."
          breadcrumbs={[
            { label: "Cart", href: ROUTES.cart },
            { label: "Checkout" },
          ]}
        />

        {activePurchaseOrder ? (
          <Card className="mb-4 border-emerald-200 bg-emerald-50/40 shadow-card">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Active Purchase Order {activePurchaseOrder.poNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Waiting for seller confirmation · resume tracking
                  </p>
                </div>
              </div>
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(
                    `${ROUTES.purchaseRequestsSuccess}?po=${activePurchaseOrder.poNumber}`,
                  )
                }
              >
                <Clock3 className="h-4 w-4" />
                View Purchase Order
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-dashed border-slate-200 shadow-card">
          <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="text-lg font-semibold text-slate-900">
                Nothing to check out yet
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                Add products from the marketplace, review them in your cart,
                then return here to set a delivery address and generate a
                Purchase Order.
              </p>
            </div>

            <ol className="grid w-full max-w-xl gap-2 text-left sm:grid-cols-3">
              {[
                { n: "1", t: "Add to Cart", d: "From product details" },
                { n: "2", t: "Review Cart", d: "Confirm quantity" },
                { n: "3", t: "Checkout", d: "Generate PO" },
              ].map((item) => (
                <li
                  key={item.n}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    Step {item.n}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {item.t}
                  </p>
                  <p className="text-xs text-slate-500">{item.d}</p>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => router.push(ROUTES.marketplace)}
              >
                Browse Marketplace
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => router.push(ROUTES.cart)}
              >
                Go to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Checkout"
        description="Blind marketplace checkout — supplier identity stays with PetroTrade."
        breadcrumbs={[
          { label: "Cart", href: ROUTES.cart },
          { label: "Checkout" },
        ]}
      />

      <CheckoutStepper
        current={step}
        onStepClick={(next) => {
          const nextIdx = CHECKOUT_STEP_ORDER.indexOf(next);
          if (nextIdx <= stepIndex) setStep(next);
        }}
        className="mb-5"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-brand" />
        <span>
          Fulfilled by{" "}
          <strong className="font-semibold text-slate-800">
            PetroTrade Network
          </strong>
          {" · "}
          Verified Supply Partner · Estimated freight only until seller approval
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {step === "review" ? (
            <Card className="border-slate-200 shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Products in Order</CardTitle>
                  <Badge variant="secondary" className="rounded-lg">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Adjust quantity (±1 MT). Changes update the order summary
                  live.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-brand">
                      {item.grade.slice(0, 4).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`${ROUTES.marketplaceProduct}/${item.productId}`}
                        className="text-sm font-semibold text-slate-900 hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Grade {item.grade} · {formatInrPerMt(item.unitPrice)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Verified Supply Partner · {item.regionLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={item.quantityMt <= item.moq}
                        onClick={() =>
                          setQuantity(item.productId, item.quantityMt - 1)
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="min-w-[3.25rem] text-center text-sm font-semibold tabular-nums">
                        {item.quantityMt} MT
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={item.quantityMt >= item.availableStock}
                        onClick={() =>
                          setQuantity(item.productId, item.quantityMt + 1)
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatInr(item.unitPrice * item.quantityMt, {
                          compact: true,
                        })}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {step === "delivery" ? (
            <>
              <Card className="border-slate-200 shadow-card">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        Delivery Address
                      </CardTitle>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose where goods should be delivered. Split quantity
                        across plants if needed — total must equal{" "}
                        {formatQuantityMt(totalOrderedQty)}.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setAddressOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add New
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={distributeEvenly}
                      >
                        Split evenly
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        Allocation progress
                      </span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          allocationValid
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {formatQuantityMt(allocatedQty)} /{" "}
                        {formatQuantityMt(totalOrderedQty)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          allocationValid ? "bg-emerald-500" : "bg-amber-400",
                        )}
                        style={{
                          width: `${Math.min(
                            100,
                            totalOrderedQty
                              ? (allocatedQty / totalOrderedQty) * 100
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>
                    {!allocationValid ? (
                      <p className="mt-1.5 text-[11px] text-amber-700">
                        {remainingQty > 0
                          ? `${formatQuantityMt(remainingQty)} still unallocated`
                          : `${formatQuantityMt(Math.abs(remainingQty))} over-allocated — reduce a location`}
                      </p>
                    ) : (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Delivery quantities match order total
                      </p>
                    )}
                  </div>

                  {deliveryLocationsMock.map((loc) => {
                    const allocated =
                      deliveryAllocations.find((a) => a.locationId === loc.id)
                        ?.quantityMt ?? 0;
                    const selected = allocated > 0;
                    return (
                      <div
                        key={loc.id}
                        className={cn(
                          "rounded-xl border p-3.5 transition",
                          selected
                            ? "border-brand/40 bg-brand/[0.02] ring-1 ring-brand/15"
                            : "border-slate-200",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {loc.name}
                              </p>
                              <Badge
                                variant="secondary"
                                className="rounded-md text-[10px]"
                              >
                                {loc.regionLabel}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {loc.address} · {loc.state} {loc.pincode}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {loc.receiverName} · {loc.phone}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-slate-500"
                            onClick={() => assignAllTo(loc.id)}
                          >
                            Assign all
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Label className="text-xs text-slate-500">
                            Delivery Qty (MT)
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              disabled={allocated <= 0}
                              onClick={() =>
                                setDeliveryAllocation(loc.id, allocated - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={allocated || ""}
                              placeholder="0"
                              className="h-8 w-20 rounded-lg text-center font-semibold"
                              onChange={(e) =>
                                setDeliveryAllocation(
                                  loc.id,
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                setDeliveryAllocation(loc.id, allocated + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {allocated > 0 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-600"
                              onClick={() => removeDeliveryAllocation(loc.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {customAddresses.map((addr) => {
                    const allocated =
                      deliveryAllocations.find((a) => a.locationId === addr.id)
                        ?.quantityMt ?? 0;
                    const selected = allocated > 0;
                    return (
                      <div
                        key={addr.id}
                        className={cn(
                          "rounded-xl border p-3.5 transition",
                          selected
                            ? "border-brand/40 bg-brand/[0.02] ring-1 ring-brand/15"
                            : "border-slate-200",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {addr.label}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                              , {addr.state} {addr.pincode}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {addr.contactPerson} · {addr.phone}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-slate-500"
                            onClick={() => assignAllTo(addr.id)}
                          >
                            Assign all
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Label className="text-xs text-slate-500">
                            Delivery Qty (MT)
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              disabled={allocated <= 0}
                              onClick={() =>
                                setDeliveryAllocation(addr.id, allocated - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={allocated || ""}
                              placeholder="0"
                              className="h-8 w-20 rounded-lg text-center font-semibold"
                              onChange={(e) =>
                                setDeliveryAllocation(
                                  addr.id,
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                setDeliveryAllocation(addr.id, allocated + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {allocated > 0 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-600"
                              onClick={() => removeDeliveryAllocation(addr.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={sameAsShipping}
                      onCheckedChange={(v) => setSameAsShipping(v === true)}
                    />
                    Same as delivery address
                  </label>
                  {!sameAsShipping ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {allAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setBillingAddressId(addr.id)}
                          className={cn(
                            "rounded-xl border p-3.5 text-left transition",
                            billingAddressId === addr.id
                              ? "border-brand bg-brand/[0.03] ring-1 ring-brand/30"
                              : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <p className="text-sm font-semibold">{addr.label}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {addr.line1}, {addr.city}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                      <MapPin className="mr-1 inline h-3.5 w-3.5" />
                      {deliveryLabel(primaryDeliveryId)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">GST & Remarks</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input
                      value={gstNumber}
                      onChange={(e) =>
                        setGstNumber(e.target.value.toUpperCase())
                      }
                      className="rounded-xl uppercase"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Remarks (optional)</Label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                      placeholder="Special handling or delivery notes…"
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          {step === "payment" ? (
            <Card className="border-slate-200 shadow-card">
              <CardContent className="p-5">
                <CheckoutPaymentSelector
                  selectedMethodId={selectedPaymentMethodId}
                  creditTermDays={creditTermDays}
                  onSelect={setSelectedPaymentMethodId}
                  onCreditTermChange={setCreditTermDays}
                />
              </CardContent>
            </Card>
          ) : null}

          {step === "confirm" ? (
            <Card className="border-slate-200 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Confirm & Generate PO
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Review details below. A Purchase Order ID is auto-generated
                  and a 15-minute seller confirmation window starts immediately.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConfirmBlock title="Products">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-700">
                        {item.name}{" "}
                        <span className="text-slate-400">
                          · {formatQuantityMt(item.quantityMt)}
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatInr(item.unitPrice * item.quantityMt, {
                          compact: true,
                        })}
                      </span>
                    </div>
                  ))}
                </ConfirmBlock>

                <ConfirmBlock title="Delivery">
                  {deliveryAllocations.map((a) => {
                    return (
                      <div
                        key={a.locationId}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-700">
                          {deliveryLabel(a.locationId)}
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatQuantityMt(a.quantityMt)}
                        </span>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-sm text-slate-700">
                    Bill:{" "}
                    {sameAsShipping
                      ? "Same as delivery"
                      : (getCheckoutAddressById(
                          billingAddressId,
                          customAddresses,
                        )?.label ?? "—")}
                  </p>
                  <p className="text-sm text-slate-700">GST: {gstNumber}</p>
                </ConfirmBlock>

                <ConfirmBlock title="Payment Details">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Selected Payment</span>
                    <span className="font-medium text-slate-800">
                      {paymentLabel ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Payment Timing</span>
                    <span className="font-medium text-slate-800">
                      {selectedPaymentMethodId === "credit"
                        ? getCreditTermLabel(creditTermDays)
                        : selectedPaymentMethodId
                          ? getCheckoutPaymentOption(selectedPaymentMethodId)
                              .timing
                          : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-medium text-amber-700">
                      Pending Seller Approval
                    </span>
                  </div>
                </ConfirmBlock>

                <ul className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5",
                        allocationValid ? "text-emerald-600" : "text-slate-300",
                      )}
                    />
                    Delivery quantities match order total
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5",
                        deliveryOk ? "text-emerald-600" : "text-slate-300",
                      )}
                    />
                    Delivery address & GST provided
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5",
                        paymentOk ? "text-emerald-600" : "text-slate-300",
                      )}
                    />
                    Payment method selected for seller review
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Supplier identity hidden (blind marketplace)
                  </li>
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              {step === "review" ? "Back to Cart" : "Previous"}
            </Button>
            {step !== "confirm" ? (
              <Button
                type="button"
                className="rounded-xl bg-brand hover:bg-brand-700"
                disabled={step === "payment" && !paymentOk}
                onClick={goNext}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-xl bg-brand hover:bg-brand-700"
                disabled={submitting || !deliveryOk || !paymentOk}
                onClick={handlePlaceOrder}
              >
                <FileText className="h-4 w-4" />
                {submitting ? "Generating…" : "Generate Purchase Order"}
              </Button>
            )}
          </div>
        </div>

        <Card className="h-fit border-slate-200 shadow-card lg:sticky lg:top-24">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow
              label="Products"
              value={`${items.length} · ${formatQuantityMt(totalOrderedQty)}`}
            />
            <SummaryRow label="Subtotal" value={formatInr(cartSubtotal)} />
            <SummaryRow label="GST (18%)" value={formatInr(gst)} />
            <SummaryRow
              label="Estimated Freight"
              value={formatInr(estimatedFreight)}
            />
            <SummaryRow label="Insurance" value="Included" />
            <div className="border-t border-slate-100 pt-3">
              <div className="mb-2">
                <PaymentSummary
                  methodId={selectedPaymentMethodId}
                  creditTermDays={
                    selectedPaymentMethodId === "credit"
                      ? creditTermDays
                      : undefined
                  }
                />
              </div>
              <SummaryRow
                label="Grand Total"
                value={formatInr(grandTotal)}
                emphasize
              />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Payment terms are shared with PetroTrade before seller approval.
              Settlement happens after Proforma Invoice, based on your selected
              method. Actual freight is confirmed after approval.
            </p>

            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
              <p className="font-semibold uppercase tracking-wide text-slate-400">
                Step status
              </p>
              <StatusLine ok={items.length > 0} label="Products reviewed" />
              <StatusLine ok={deliveryOk} label="Delivery & GST" />
              <StatusLine ok={paymentOk} label="Payment method selected" />
              <StatusLine
                ok={step === "confirm" && deliveryOk && paymentOk}
                label="Ready to generate PO"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Delivery Address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {(
              [
                ["label", "Location Name"],
                ["line1", "Address"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "PIN"],
                ["contactPerson", "Contact Person"],
                ["phone", "Phone"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={newAddress[key]}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="rounded-xl"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setAddressOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                if (
                  !newAddress.label ||
                  !newAddress.line1 ||
                  !newAddress.pincode
                ) {
                  toast.error("Fill required address fields");
                  return;
                }
                const id = addCustomAddress(newAddress);
                assignAllTo(id);
                setAddressOpen(false);
                setNewAddress({
                  label: "",
                  line1: "",
                  line2: "",
                  city: "",
                  state: "",
                  pincode: "",
                  contactPerson: "",
                  phone: "",
                });
                toast.success("Delivery address added");
              }}
            >
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function ConfirmBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3.5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className="flex items-center gap-1.5">
      <CheckCircle2
        className={cn(
          "h-3.5 w-3.5",
          ok ? "text-emerald-600" : "text-slate-300",
        )}
      />
      <span className={ok ? "text-slate-700" : undefined}>{label}</span>
    </p>
  );
}

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span
        className={
          emphasize ? "font-semibold text-slate-900" : "text-slate-500"
        }
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasize
            ? "text-base font-bold text-slate-900"
            : "font-medium text-slate-800",
        )}
      >
        {value}
      </span>
    </div>
  );
}
