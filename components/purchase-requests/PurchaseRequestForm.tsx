"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PACKAGING_OPTIONS,
  shippingAddressesMock,
  billingAddressesMock,
} from "@/mock/purchase-request";
import {
  purchaseRequestFormSchema,
  refineQuantityAgainstMoq,
  type PurchaseRequestFormSchema,
} from "@/lib/purchase-request-schemas";
import type {
  PurchaseRequestFormData,
  SelectedProduct,
} from "@/types/purchase-request";
import { ProductSummary } from "./ProductSummary";
import { QuantitySelector } from "./QuantitySelector";
import { BillingCard } from "./BillingCard";
import { AddressCard } from "./AddressCard";

interface PurchaseRequestFormProps {
  product: SelectedProduct;
  defaultValues: PurchaseRequestFormData;
  onSubmit: (data: PurchaseRequestFormData) => void;
  submitLabel?: string;
}

export function PurchaseRequestForm({
  product,
  defaultValues,
  onSubmit,
  submitLabel = "Proceed to Checkout",
}: PurchaseRequestFormProps) {
  const form = useForm<PurchaseRequestFormSchema>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: {
      ...defaultValues,
      packaging: defaultValues.packaging as (typeof PACKAGING_OPTIONS)[number],
    },
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      ...defaultValues,
      packaging: defaultValues.packaging as (typeof PACKAGING_OPTIONS)[number],
    });
  }, [defaultValues, product.id, reset]);

  const quantityMt = watch("quantityMt");
  const sameAsShipping = watch("sameAsShipping");
  const deliveryLocationId = watch("deliveryLocationId");
  const billingAddressId = watch("billingAddressId");

  const quantityError =
    refineQuantityAgainstMoq(quantityMt, product.moq, product.availableStock) ??
    errors.quantityMt?.message;

  const onValid = (data: PurchaseRequestFormSchema) => {
    const moqError = refineQuantityAgainstMoq(
      data.quantityMt,
      product.moq,
      product.availableStock,
    );
    if (moqError) {
      form.setError("quantityMt", { message: moqError });
      return;
    }

    onSubmit({
      ...data,
      expectedDeliveryDate: data.expectedDeliveryDate ?? "",
      purchaseOrderReference: data.purchaseOrderReference ?? "",
      // Delivery address is the single destination — shipping mirrors it
      shippingAddressId: data.deliveryLocationId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5">
      <ProductSummary product={product} quantityMt={quantityMt} />

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="quantityMt"
            render={({ field }) => (
              <QuantitySelector
                value={field.value}
                moq={product.moq}
                max={product.availableStock}
                increment={1}
                onChange={field.onChange}
                error={quantityError}
                className="sm:col-span-2"
              />
            )}
          />

          <div className="space-y-2">
            <Label>Packaging</Label>
            <Controller
              control={control}
              name="packaging"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.packaging ? (
              <p className="text-xs text-red-600">{errors.packaging.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              placeholder="27AABCP1234D1Z5"
              className="uppercase"
              {...register("gstNumber")}
            />
            {errors.gstNumber ? (
              <p className="text-xs text-red-600">{errors.gstNumber.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="purchaseOrderReference">Purchase Order ID</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="purchaseOrderReference"
                className="pl-9 font-mono"
                readOnly
                value={
                  watch("purchaseOrderReference") ||
                  defaultValues.purchaseOrderReference
                }
              />
            </div>
            <p className="text-xs text-slate-400">Generated Automatically</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              rows={3}
              placeholder="Any special handling or delivery notes…"
              {...register("remarks")}
            />
            {errors.remarks ? (
              <p className="text-xs text-red-600">{errors.remarks.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Delivery Address</CardTitle>
          <p className="text-xs text-slate-500">
            Where goods should be delivered. Freight is calculated from the
            selected hub.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {shippingAddressesMock.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={deliveryLocationId === address.id}
              onSelect={(id) => {
                setValue("deliveryLocationId", id, { shouldValidate: true });
                setValue("shippingAddressId", id, { shouldValidate: true });
              }}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={sameAsShipping}
              onCheckedChange={(checked) => {
                setValue("sameAsShipping", checked === true);
              }}
            />
            Same as delivery address
          </label>
          {!sameAsShipping ? (
            <div className="grid gap-3 md:grid-cols-2">
              {billingAddressesMock.map((address) => (
                <BillingCard
                  key={address.id}
                  address={address}
                  selected={billingAddressId === address.id}
                  onSelect={(id) =>
                    setValue("billingAddressId", id, { shouldValidate: true })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              {shippingAddressesMock.find((a) => a.id === deliveryLocationId)
                ?.warehouseName ?? "Selected delivery address"}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-11 min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
