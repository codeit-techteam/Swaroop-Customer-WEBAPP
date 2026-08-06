"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Factory, Lock } from "lucide-react";
import {
  companyInfoSchema,
  type CompanyInfoFormValues,
} from "@/lib/onboarding-schemas";
import {
  CONSTITUTION_OPTIONS,
  INDUSTRY_SECTOR_OPTIONS,
  ONBOARDING_ROUTES,
} from "@/constants/onboarding";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  OnboardingLayout,
  RouteGuard,
  StepHeader,
  InfoCard,
  SaveDraftButton,
  ContinueButton,
} from "@/components/onboarding";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConstitutionType, IndustrySector } from "@/types/onboarding";

export default function CompanyInformationPage() {
  return (
    <RouteGuard stepId="company-information">
      <OnboardingLayout saveDraftVariant="solid" helpVariant="card">
        <CompanyInformationForm />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function CompanyInformationForm() {
  const router = useRouter();
  const companyInfo = useOnboardingStore((s) => s.companyInfo);
  const saveCompany = useOnboardingStore((s) => s.saveCompany);
  const user = useAuthStore((s) => s.user);

  const legalName =
    companyInfo.legalName.trim() ||
    user?.companyName?.trim() ||
    user?.name?.trim() ||
    "";

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      constitutionType: (companyInfo.constitutionType ||
        undefined) as CompanyInfoFormValues["constitutionType"],
      industrySector: (companyInfo.industrySector ||
        undefined) as CompanyInfoFormValues["industrySector"],
      registrationNumber: companyInfo.registrationNumber,
    },
    mode: "onChange",
  });

  function onSubmit(values: CompanyInfoFormValues) {
    saveCompany({
      legalName,
      constitutionType: values.constitutionType as ConstitutionType,
      industrySector: (values.industrySector || "") as IndustrySector | "",
      registrationNumber: values.registrationNumber ?? "",
      dateOfIncorporation: "",
    });
    router.push(ONBOARDING_ROUTES.gstVerification);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <StepHeader
          stepLabel="Step 1 of 6"
          title="Company Information"
          description="Please provide the legal details of your organization to initiate the trade verification process."
          illustration={<PlantIllustration />}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-900">
                Company Legal Name
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {legalName || "—"}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Taken from your registration business name.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="constitutionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constitution Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Constitution type">
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONSTITUTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industrySector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Industry sector">
                          <SelectValue placeholder="Select primary sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRY_SECTOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Number (CIN/LLPIN) (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="U00000XX0000XXX000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <InfoCard>
              This name comes from registration and is used for GST
              verification.
            </InfoCard>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Encrypted Data Submission
              </p>
              <div className="flex items-center justify-end gap-3">
                <SaveDraftButton variant="outline" />
                <ContinueButton label="Continue to GST" type="submit" />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

function PlantIllustration() {
  return (
    <div
      className="flex h-24 w-28 items-end justify-center rounded-xl bg-gradient-to-br from-sky-100 to-slate-200 p-2"
      aria-hidden="true"
    >
      <Factory className="h-14 w-14 text-slate-500" />
    </div>
  );
}
