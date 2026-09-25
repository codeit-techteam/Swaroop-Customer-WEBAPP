"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkoutErrorMessage,
  createCustomerQuote,
  fetchCustomerPaymentOptions,
  toBackendPaymentOption,
  type CheckoutPaymentOption,
  type CheckoutQuote,
} from "@/services/checkout";
import type { PaymentMethodId, PaymentOption } from "@/types/product-details";

export function mapBackendPaymentOptions(
  options: CheckoutPaymentOption[],
): PaymentOption[] {
  return options.map((option) => {
    const id: PaymentMethodId =
      option.paymentOption === "ON_LOADING"
        ? "on_loading"
        : option.paymentOption === "ON_DELIVERY"
          ? "on_delivery"
          : option.paymentOption === "CREDIT_30" ||
              option.paymentOption === "CREDIT"
            ? "credit_30"
            : option.paymentOption === "CREDIT_15"
              ? "credit_15"
              : "advance";
    return {
      id,
      title: option.title,
      description: option.description,
      benefitLabel: option.benefitLabel,
      discountRate: option.discountBps ? option.discountBps / 10000 : undefined,
      eligible: option.eligible,
    };
  });
}

export function useCustomerQuote(args: {
  productId: string | null;
  offerId?: string | null;
  quantity: number;
  paymentId: PaymentMethodId;
  enabled: boolean;
}) {
  const { productId, offerId, quantity, paymentId, enabled } = args;
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled || !productId || !(quantity > 0)) {
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const next = await createCustomerQuote({
        productId,
        offerId: offerId ?? undefined,
        quantity,
        paymentOption: toBackendPaymentOption(paymentId),
      });
      if (seq !== requestSeq.current) return;
      setQuote(next);
    } catch (cause) {
      if (seq !== requestSeq.current) return;
      setQuote(null);
      setError(checkoutErrorMessage(cause, "Unable to load latest pricing"));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [enabled, offerId, paymentId, productId, quantity]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void refresh();
    }, 250);
    return () => clearTimeout(handle);
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomerPaymentOptions()
      .then((result) => {
        if (!cancelled)
          setPaymentOptions(mapBackendPaymentOptions(result.options));
      })
      .catch(() => {
        if (!cancelled) setPaymentOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { quote, paymentOptions, loading, error, refresh };
}
