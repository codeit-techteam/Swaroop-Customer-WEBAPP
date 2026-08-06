"use client";

import { Clock, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_CONTACT } from "@/constants/support";

export function ContactInfoCard() {
  return (
    <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold text-brand">PetroTrade Support</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Email
              </p>
              <a
                href={SUPPORT_CONTACT.emailHref}
                className="text-sm font-medium text-brand hover:underline"
              >
                {SUPPORT_CONTACT.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Phone
              </p>
              <a
                href={SUPPORT_CONTACT.phoneHref}
                className="text-sm font-medium text-brand hover:underline"
              >
                {SUPPORT_CONTACT.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Business Hours
              </p>
              <p className="text-sm font-medium text-slate-700">
                {SUPPORT_CONTACT.businessHours}
              </p>
              <p className="text-sm text-slate-500">
                {SUPPORT_CONTACT.businessHoursTime}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Emergency Support
          </p>
          <p className="mt-1 text-sm text-amber-900">
            {SUPPORT_CONTACT.emergencyNote}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
