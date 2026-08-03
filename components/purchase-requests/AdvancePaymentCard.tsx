"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { ADVANCE_PAYMENT_DISCOUNT } from "@/mock/purchase-request";

export function AdvancePaymentCard() {
  return (
    <Card className="border-sky-200 bg-sky-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-sky-900">
          <Info className="h-4 w-4" aria-hidden />
          Advance Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-sky-900/80">
        <ul className="grid gap-2 sm:grid-cols-3">
          {["100% Advance", "Instant Processing", "Lowest Pricing"].map(
            (item) => (
              <li
                key={item}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-center text-xs font-semibold text-sky-900"
              >
                {item}
              </li>
            ),
          )}
        </ul>
        <p className="text-xs leading-relaxed">
          Flat discount of{" "}
          <strong>
            {formatInr(ADVANCE_PAYMENT_DISCOUNT, { compact: true })}
          </strong>{" "}
          applies. Pay before dispatch for preferred pricing and priority
          allocation.
        </p>
      </CardContent>
    </Card>
  );
}
