"use client";

import { useEffect } from "react";
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

interface RequestQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerTitle: string;
  offerDescription?: string;
  minQuantityMt?: number;
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

export function RequestQuoteDialog({
  open,
  onOpenChange,
  offerTitle,
  offerDescription,
  minQuantityMt = 500,
}: RequestQuoteDialogProps) {
  const user = useAuthStore((s) => s.user);

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

  async function onSubmit(values: RequestQuoteFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    toast.success("Quote request submitted", {
      description: `Our trading desk will respond within 24 hours for your ${values.quantityMt} MT order.`,
    });

    form.reset(defaultValues);
    onOpenChange(false);
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
              "Share your bulk order requirements and our institutional trading desk will prepare a custom quote."}
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
                label="Company name"
                placeholder="Registered business name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="email"
                label="Work email"
                type="email"
                placeholder="you@company.com"
              />
              <FormInput
                control={form.control}
                name="phone"
                label="Phone number"
                type="tel"
                placeholder="10-digit mobile"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="quantityMt"
                label="Quantity (MT)"
                type="number"
                placeholder={`Min. ${minQuantityMt}`}
              />
              <FormInput
                control={form.control}
                name="deliveryLocation"
                label="Delivery location"
                placeholder="City, state, or port"
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Packaging, delivery timeline, logistics preferences…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit Quote Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
