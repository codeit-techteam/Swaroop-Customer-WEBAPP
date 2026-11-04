"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchLegalLinks,
  openContactSupport,
  type LegalLinks,
} from "@/lib/legal-links";

/**
 * Contact details come from the backend legal-links API, with approved
 * PolyStoreX fallbacks (it@polystorex.com / +91 99626 20101).
 */
export function ContactInfoCard() {
  const [links, setLinks] = useState<LegalLinks | null>(null);

  useEffect(() => {
    let active = true;
    void fetchLegalLinks().then((value) => {
      if (active) setLinks(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const phoneTel = links?.supportPhone?.replace(/\s/g, "") ?? "";

  return (
    <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold text-brand">PolyStoreX Support</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {links?.supportEmail ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Email
                </p>
                <a
                  href={`mailto:${links.supportEmail}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {links.supportEmail}
                </a>
              </div>
            </div>
          ) : null}

          {links?.supportPhone ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Phone
                </p>
                <a
                  href={`tel:${phoneTel}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {links.supportPhone}
                </a>
              </div>
            </div>
          ) : null}

          {links?.supportWhatsapp ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  WhatsApp
                </p>
                <a
                  href={links.supportWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <ExternalLink className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Support page
              </p>
              <button
                type="button"
                onClick={() => void openContactSupport()}
                className="text-sm font-medium text-brand hover:underline"
              >
                Contact PolyStoreX
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
