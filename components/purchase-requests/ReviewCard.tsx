"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatQuantityMt } from "@/lib/format";
import {
  formatPackagingDisplay,
  getPaymentMethodById,
} from "@/mock/purchase-request";
import { getBillingAddressById } from "@/mock/purchase-request/billingAddress";
import { getShippingAddressById } from "@/mock/purchase-request/shippingAddress";
import type {
  OrderSummaryBreakdown,
  PaymentMethodId,
  PurchaseRequestFormData,
  SelectedProduct,
} from "@/types/purchase-request";

interface ReviewCardProps {
  product: SelectedProduct;
  form: PurchaseRequestFormData;
  paymentMethodId: PaymentMethodId;
  summary: OrderSummaryBreakdown;
  onEdit?: (section: "product" | "delivery" | "payment" | "addresses") => void;
  showPayment?: boolean;
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-brand"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

export function ReviewCard({
  product,
  form,
  paymentMethodId,
  summary,
  onEdit,
  showPayment = true,
}: ReviewCardProps) {
  const shipping = getShippingAddressById(form.shippingAddressId);
  const billing = getBillingAddressById(form.billingAddressId);
  const method = getPaymentMethodById(paymentMethodId);
  const packaging = formatPackagingDisplay(form.packaging, form.quantityMt);

  return (
    <div className="space-y-4">
      <Section
        title="Product"
        onEdit={onEdit ? () => onEdit("product") : undefined}
      >
        <Row label="Material" value={product.name} />
        <Row label="Grade" value={product.grade} />
        <Row label="Manufacturer" value={product.manufacturer} />
        <Row label="Warehouse" value={product.warehouse} />
        <Row label="Quantity" value={formatQuantityMt(form.quantityMt)} />
        <Row label="Packaging" value={packaging} />
        <Row
          label="Rate"
          value={`₹${product.currentPricePerMt.toLocaleString("en-IN")} / MT`}
        />
      </Section>

      <Section
        title="Delivery"
        onEdit={onEdit ? () => onEdit("delivery") : undefined}
      >
        <Row label="Delivery Location" value={shipping.warehouseName} />
        <Row label="Expected Delivery" value={form.expectedDeliveryDate} />
        <Row label="ETA" value={shipping.etaLabel} />
        <Row label="Remarks" value={form.remarks.trim() ? form.remarks : "—"} />
        <Row label="GST Number" value={form.gstNumber} />
        <Row
          label="PO Reference"
          value={
            form.purchaseOrderReference.trim()
              ? form.purchaseOrderReference
              : "—"
          }
        />
      </Section>

      <Section
        title="Addresses"
        onEdit={onEdit ? () => onEdit("addresses") : undefined}
      >
        <Row
          label="Shipping"
          value={`${shipping.line1}, ${shipping.line2}, ${shipping.state} ${shipping.pincode}`}
        />
        <Row
          label="Billing"
          value={`${billing.companyName}, ${billing.city}, ${billing.state}`}
        />
      </Section>

      {showPayment ? (
        <Section
          title="Payment Method"
          onEdit={onEdit ? () => onEdit("payment") : undefined}
        >
          <Row label="Method" value={method.title} />
          <Row label="Timing" value={method.timing} />
        </Section>
      ) : null}

      <Section title="Amount Summary">
        <Row
          label="Estimated Amount"
          value={formatInr(summary.baseSubtotal, { compact: true })}
        />
        <Row
          label="GST (18%)"
          value={formatInr(summary.gst, { compact: true })}
        />
        <Row
          label="Freight"
          value={formatInr(summary.freight, { compact: true })}
        />
        {summary.discount > 0 ? (
          <Row
            label="Discount"
            value={`−${formatInr(summary.discount, { compact: true })}`}
          />
        ) : null}
        {summary.interest > 0 ? (
          <Row
            label="Credit Charges"
            value={formatInr(summary.interest, { compact: true })}
          />
        ) : null}
        <Row
          label="Final Amount"
          value={formatInr(summary.grandTotal, { compact: true })}
        />
      </Section>
    </div>
  );
}
