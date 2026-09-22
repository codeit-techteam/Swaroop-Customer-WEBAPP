"use client";

import { Info } from "lucide-react";
import { CHECKOUT_PAYMENT_PROTOCOL } from "./constants";

export function PaymentProtocolCard() {
  const { title, bodyPrefix, bodyMiddle, bodySuffix, highlights } =
    CHECKOUT_PAYMENT_PROTOCOL;

  return (
    <section className="flex gap-3 rounded-2xl border border-accent-blue/20 bg-accent-blue/5 p-5 shadow-card">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
        <Info className="h-4 w-4" />
      </div>
      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-[13px] leading-5 text-slate-600">
          {bodyPrefix}{" "}
          <span className="font-semibold text-accent-blue">{highlights[0]}</span>
          {" / "}
          <span className="font-semibold text-accent-blue">{highlights[1]}</span>{" "}
          {bodyMiddle}{" "}
          <span className="font-semibold text-accent-blue">{highlights[2]}</span>{" "}
          {bodySuffix}
        </p>
      </div>
    </section>
  );
}
