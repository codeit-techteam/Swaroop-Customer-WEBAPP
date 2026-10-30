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
import type {
  CreditAccessView,
  CreditLoadState,
  ProductCreditConfig,
} from "@/types/payment-eligibility";
import { CREDIT_LOAD_ERROR } from "@/types/payment-eligibility";
import type { PaymentMethodId, PaymentOption } from "@/types/product-details";

export function mapBackendPaymentOptions(
  options: CheckoutPaymentOption[],
): PaymentOption[] {
  return options
    .filter((option) => Boolean(option.title?.trim()))
    .map((option) => {
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
        dueLabel: option.dueLabel ?? undefined,
        benefitLabel: option.benefitLabel ?? undefined,
        discountRate: option.discountBps
          ? option.discountBps / 10000
          : undefined,
        // Locked credit previews stay visible so buyers can Request Credit.
        eligible: option.eligible !== false,
      };
    });
}

export function useCustomerQuote(args: {
  productId: string | null;
  offerId?: string | null;
  quantity: number;
  paymentId: PaymentMethodId;
  enabled: boolean;
  amount?: number;
}) {
  const { productId, offerId, quantity, paymentId, enabled, amount } = args;
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [creditAccess, setCreditAccess] = useState<CreditAccessView | null>(
    null,
  );
  const [productCredit, setProductCredit] =
    useState<ProductCreditConfig | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditLoadState>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const creditSeq = useRef(0);

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

  const loadCredit = useCallback(() => {
    if (!enabled) {
      return Promise.resolve();
    }
    const seq = ++creditSeq.current;
    return fetchCustomerPaymentOptions({
      amount: amount && amount > 0 ? amount : undefined,
      productId: productId ?? undefined,
      offerId: offerId ?? undefined,
    })
      .then((result) => {
        if (seq !== creditSeq.current) return;
        setPaymentOptions(mapBackendPaymentOptions(result.options));
        setProductCredit(result.productCredit ?? null);
        setCreditAccess(result.credit);
        setCreditStatus("ready");
      })
      .catch(() => {
        if (seq !== creditSeq.current) return;
        setPaymentOptions([]);
        setCreditAccess(CREDIT_LOAD_ERROR);
        setCreditStatus("error");
      });
  }, [amount, enabled, offerId, productId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = window.setTimeout(() => {
      void loadCredit();
    }, 200);
    return () => {
      creditSeq.current += 1;
      window.clearTimeout(handle);
    };
  }, [enabled, loadCredit]);

  const resolvedCreditStatus: CreditLoadState = !enabled
    ? "idle"
    : creditStatus === "idle"
      ? "loading"
      : creditStatus;

  return {
    quote,
    paymentOptions: enabled ? paymentOptions : [],
    creditAccess: enabled ? creditAccess : null,
    productCredit,
    creditStatus: resolvedCreditStatus,
    loading,
    error,
    refresh,
    refreshCredit: () => {
      if (!enabled) return;
      setCreditStatus("loading");
      void loadCredit();
    },
  };
}
