"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  businessAddressSchema,
  type BusinessAddressFormValues,
} from "@/lib/onboarding-schemas";
import {
  COUNTRY_OPTIONS,
  ONBOARDING_ROUTES,
  PINCODE_LOOKUP,
} from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  OnboardingLayout,
  RouteGuard,
  StepHeader,
  SectionCard,
  InfoCard,
  MapPreview,
  BackButton,
  SaveDraftLink,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function BusinessAddressPage() {
  return (
    <RouteGuard stepId="business-address">
      <OnboardingLayout saveDraftVariant="outline" helpVariant="button">
        <BusinessAddressForm />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function BusinessAddressForm() {
  const router = useRouter();
  const businessAddress = useOnboardingStore((s) => s.businessAddress);
  const saveBusinessAddress = useOnboardingStore((s) => s.saveBusinessAddress);

  const form = useForm<BusinessAddressFormValues>({
    resolver: zodResolver(businessAddressSchema),
    defaultValues: {
      addressLine1: businessAddress.addressLine1,
      addressLine2: businessAddress.addressLine2,
      pincode: businessAddress.pincode,
      city: businessAddress.city,
      state: businessAddress.state,
      country: businessAddress.country || "India",
      useAsShipping: businessAddress.useAsShipping,
    },
    mode: "onChange",
  });

  const pincode = form.watch("pincode");
  const city = form.watch("city");
  const pincodeValid =
    /^\d{6}$/.test(pincode) && Boolean(PINCODE_LOOKUP[pincode] || city);

  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) return;
    const match = PINCODE_LOOKUP[pincode];
    if (!match) return;
    form.setValue("city", match.city, { shouldValidate: true });
    form.setValue("state", match.state, { shouldValidate: true });
  }, [pincode, form]);

  function onSubmit(values: BusinessAddressFormValues) {
    saveBusinessAddress({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      pincode: values.pincode,
      city: values.city,
      state: values.state,
      country: values.country,
      useAsShipping: values.useAsShipping,
    });
    router.push(ONBOARDING_ROUTES.shippingAddress);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <StepHeader
        title="Step 3: Business Address"
        description="Please provide the registered office address for your organization as per tax records."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SectionCard title="Registered Office Address">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Building No, Street Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Floor, Landmark, Area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode / Zip Code</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="400001"
                              maxLength={6}
                              inputMode="numeric"
                              {...field}
                              className={cn(pincodeValid && "pr-10")}
                            />
                            {pincodeValid ? (
                              <CheckCircle2
                                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
                                aria-hidden="true"
                              />
                            ) : null}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-slate-50 text-slate-600"
                            aria-readonly="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-slate-50 text-slate-600"
                            aria-readonly="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger aria-label="Country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((opt) => (
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
                  name="useAsShipping"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 pt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          aria-label="Use this as my shipping address"
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-slate-700">
                        Use this as my shipping address
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <MapPreview city={city || "Mumbai"} className="h-56 w-full" />
                <InfoCard>
                  Your address is automatically verified against GSTN records
                  for accuracy. Any discrepancies may delay your onboarding.
                </InfoCard>
              </div>
            </div>
          </SectionCard>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BackButton href={ONBOARDING_ROUTES.gstVerification} />
            <div className="flex items-center justify-end gap-4">
              <SaveDraftLink />
              <ContinueButton
                label="Continue to Shipping Address"
                type="submit"
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
