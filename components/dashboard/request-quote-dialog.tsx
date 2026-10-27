"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  requestQuoteSchema,
  type RequestQuoteFormValues,
} from "@/lib/request-quote-schemas";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

interface RequestQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerTitle: string;
  offerDescription?: string;
  minQuantityMt?: number;
  /** When known, deep-link into marketplace product after login. */
  productId?: string;
  gradeId?: string;
}

const defaultValues: RequestQuoteFormValues = {
  contactName: "",
  companyName: "",
  email: "",
  phone: "",
  quantityMt: 500,
  deliveryLocation: "",
  message: "",
};

/**
 * RFQ entry point — does not create a parallel RFQ entity.
 * Authenticated users are sent to checkout/marketplace to create a Purchase Request
 * (the platform RFQ). Guests must sign in first and return via `?next=`.
 */
export function RequestQuoteDialog({
  open,
  onOpenChange,
  offerTitle,
  offerDescription,
  minQuantityMt = 500,
  productId,
  gradeId,
}: RequestQuoteDialogProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const form = useForm<RequestQuoteFormValues>({
    resolver: zodResolver(
      requestQuoteSchema.refine((data) => data.quantityMt >= minQuantityMt, {
        message: `Minimum order quantity is ${minQuantityMt} MT`,
        path: ["quantityMt"],
      }),
    ),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      ...defaultValues,
      contactName: user?.name ?? "",
      companyName: user?.companyName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      quantityMt: minQuantityMt,
    });
  }, [open, user, form, minQuantityMt]);

  const { isSubmitting } = form.formState;

  function continueToPurchaseRequest(values: RequestQuoteFormValues) {
    const params = new URLSearchParams();
    params.set("qty", String(values.quantityMt));
    if (values.deliveryLocation)
      params.set("destination", values.deliveryLocation);
    if (values.message) params.set("notes", values.message);
    if (productId) params.set("productId", productId);
    if (gradeId) params.set("gradeId", gradeId);
    params.set("rfq", "1");
    const destination = productId
      ? `${ROUTES.marketplaceProduct}/${productId}?${params.toString()}`
      : `${ROUTES.marketplace}?${params.toString()}`;

    if (!isAuthenticated) {
      const login = new URL(ROUTES.login, window.location.origin);
      login.searchParams.set("next", destination);
      toast.message("Sign in to submit a purchase request", {
        description: "Your RFQ details will be available after you return.",
      });
      onOpenChange(false);
      router.push(`${login.pathname}${login.search}`);
      return;
    }

    toast.success("Continue to place your purchase request", {
      description: `Use checkout on ${offerTitle} to create an official Purchase Request (RFQ).`,
    });
    onOpenChange(false);
    router.push(destination);
  }

  async function onSubmit(values: RequestQuoteFormValues) {
    continueToPurchaseRequest(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset(defaultValues);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Quote — {offerTitle}</DialogTitle>
          <DialogDescription>
            {offerDescription ??
              "Share your requirements. Quotes are handled as Purchase Requests on PolyStoreX — the same RFQ workflow used at checkout."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="contactName"
                label="Contact person"
                placeholder="Full name"
              />
              <FormInput
                control={form.control}
                name="companyName"
                label="Company"
                placeholder="Legal name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="you@company.com"
              />
              <FormInput
                control={form.control}
                name="phone"
                label="Phone"
                placeholder="+91…"
              />
            </div>
            <FormInput
              control={form.control}
              name="quantityMt"
              label="Quantity (MT)"
              type="number"
            />
            <FormInput
              control={form.control}
              name="deliveryLocation"
              label="Destination"
              placeholder="City / warehouse"
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Specs, packaging, delivery window…"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isAuthenticated
                  ? "Continue to purchase request"
                  : "Sign in to continue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
