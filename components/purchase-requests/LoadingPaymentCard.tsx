"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoadingPaymentCard() {
  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-amber-900">
          <Info className="h-4 w-4" aria-hidden />
          On Loading Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-900/80">
        <ul className="grid gap-2 sm:grid-cols-3">
          {[
            "Payment before truck loading",
            "Loading confirmation",
            "Warehouse release process",
          ].map((item) => (
            <li
              key={item}
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-center text-xs font-semibold text-amber-900"
            >
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
