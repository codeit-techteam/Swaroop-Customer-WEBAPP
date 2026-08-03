"use client";

import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { PaymentDetailsPage } from "./PaymentDetailsPage";
import { PaymentProcessPage } from "./PaymentProcessPage";

interface PaymentIdRouterProps {
  id: string;
}

/**
 * `/payments/[id]` serves both:
 * - Payments catalog details (PAY-…)
 * - Order-journey payment process (PT-ORD-… / other order ids)
 */
export function PaymentIdRouter({ id }: PaymentIdRouterProps) {
  const catalogPayment = usePaymentsCatalogStore((s) =>
    s.payments.find((p) => p.id === id || p.paymentId === id),
  );

  if (catalogPayment || id.startsWith("PAY-")) {
    return <PaymentDetailsPage paymentId={id} />;
  }

  return <PaymentProcessPage orderId={id} />;
}
