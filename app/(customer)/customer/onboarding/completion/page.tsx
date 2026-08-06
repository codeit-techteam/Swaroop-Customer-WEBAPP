"use client";

import { useRouter } from "next/navigation";
import { Check, ArrowRight, LayoutGrid, Package, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { generateOnboardingPdf } from "@/lib/onboarding-pdf";
import { useOnboardingStore } from "@/store/onboardingStore";
import { OnboardingLayout, RouteGuard } from "@/components/onboarding";
import { Button } from "@/components/ui/button";

export default function CompletionPage() {
  return (
    <RouteGuard stepId="completion">
      <OnboardingLayout saveDraftVariant="link" helpVariant="button">
        <CompletionContent />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function CompletionContent() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  function handleGoToMarketplace() {
    completeOnboarding();
    router.push(ROUTES.marketplace);
  }

  function handleDownloadPdf() {
    try {
      generateOnboardingPdf(useOnboardingStore.getState());
      toast.success("Submission PDF downloaded");
    } catch {
      toast.error("Unable to generate PDF");
    }
  }

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        aria-hidden="true"
      >
        {[
          { left: "8%", top: "12%", color: "bg-emerald-300", rotate: "12deg" },
          { left: "18%", top: "28%", color: "bg-sky-300", rotate: "-8deg" },
          { left: "72%", top: "10%", color: "bg-emerald-200", rotate: "20deg" },
          { left: "85%", top: "32%", color: "bg-sky-200", rotate: "-15deg" },
          { left: "45%", top: "6%", color: "bg-emerald-300", rotate: "5deg" },
          { left: "60%", top: "22%", color: "bg-sky-300", rotate: "25deg" },
        ].map((c, i) => (
          <motion.span
            key={i}
            className={`absolute h-2 w-2 rounded-[2px] ${c.color}`}
            style={{ left: c.left, top: c.top, rotate: c.rotate }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          />
        ))}
      </div>

      <div className="relative grid gap-6 pt-4 lg:grid-cols-[1fr_280px]">
        <motion.div
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 16,
              delay: 0.15,
            }}
          >
            <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
          </motion.div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Application Submitted Successfully
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            Your KYC has been submitted. Our team will review it within 24–48
            business hours. You can now access the PetroTrade platform.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              className="h-11 bg-slate-900 px-6 hover:bg-slate-800"
              onClick={handleGoToMarketplace}
            >
              Go to Marketplace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 border-slate-300 px-6 text-slate-800"
              onClick={handleDownloadPdf}
            >
              Download Summary
            </Button>
          </div>
        </motion.div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Next Steps
            </h2>
            <ul className="mt-4 space-y-4">
              <NextStepItem
                icon={Package}
                iconClass="bg-sky-100 text-sky-600"
                title="Browse marketplace"
                description="Explore grades and create purchase requests."
              />
              <NextStepItem
                icon={LayoutGrid}
                iconClass="bg-sky-100 text-sky-600"
                title="Track procurement"
                description="Monitor requests, orders, and portal activity."
              />
              <NextStepItem
                icon={Truck}
                iconClass="bg-amber-100 text-amber-600"
                title="Track your orders"
                description="Follow shipments and delivery updates in real time."
              />
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NextStepItem({
  icon: Icon,
  iconClass,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </li>
  );
}
