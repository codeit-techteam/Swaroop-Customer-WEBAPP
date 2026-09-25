"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants";
import { getEffectiveOfferPrice } from "@/lib/offer-utils";
import { getLiveOfferById } from "@/lib/offer-lookup";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { useCartStore } from "@/store/cartStore";
import { useOffersStore } from "@/store/offersStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { PurchaseRequestForm } from "./PurchaseRequestForm";
import { OrderSummary } from "./OrderSummary";
import { AppliedOfferSummary } from "./AppliedOfferSummary";
import type {
  PaymentMethodId,
  PurchaseRequestFormData,
} from "@/types/purchase-request";

const PAYMENT_IDS: PaymentMethodId[] = [
  "advance",
  "on_loading",
  "on_delivery",
  "credit_15",
  "credit_30",
];

export function CreatePurchaseRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const qtyParam = searchParams.get("qty");
  const offerPriceParam = searchParams.get("offerPrice");
  const offerIdParam = searchParams.get("offerId");
  const paymentParam = searchParams.get("payment");

  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const product = usePurchaseRequestStore((s) => s.product);
  const form = usePurchaseRequestStore((s) => s.form);
  const selectedPaymentMethodId = usePurchaseRequestStore(
    (s) => s.selectedPaymentMethodId,
  );
  const hydrateProduct = usePurchaseRequestStore((s) => s.hydrateProduct);
  const setForm = usePurchaseRequestStore((s) => s.setForm);
  const setQuantity = usePurchaseRequestStore((s) => s.setQuantity);
  const getOrderSummary = usePurchaseRequestStore((s) => s.getOrderSummary);
  const markOfferApplied = useOffersStore((s) => s.markOfferApplied);
  const fetchOffers = useOffersStore((s) => s.fetchOffers);
  const offers = useOffersStore((s) => s.offers);

  useEffect(() => {
    const finish = () => {
      usePurchaseRequestStore.getState().setHydrated(true);
    };
    const unsub = usePurchaseRequestStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestStore.persist.hasHydrated()) {
      finish();
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!productId) {
      toast.message("Select a product from Marketplace to create a request");
      router.replace(ROUTES.marketplace);
      return;
    }

    if (offerIdParam && !offers.length) {
      void fetchOffers();
      return;
    }

    const offer = offerIdParam ? getLiveOfferById(offerIdParam) : undefined;
    const offerPrice = offerPriceParam ? Number(offerPriceParam) : undefined;
    const qty = qtyParam ? Number(qtyParam) : offer?.moq;
    const effectiveOfferPrice =
      offer && qty && Number.isFinite(qty)
        ? getEffectiveOfferPrice(offer, qty)
        : (offer?.offerPrice ??
          (offerPrice && Number.isFinite(offerPrice) ? offerPrice : undefined));
    const paymentMethodId = PAYMENT_IDS.includes(
      paymentParam as PaymentMethodId,
    )
      ? (paymentParam as PaymentMethodId)
      : offer?.paymentTypes[0];

    hydrateProduct(productId, {
      currentPricePerMt: effectiveOfferPrice,
      warehouse: "Western India Region",
      manufacturer: "Verified Supply Partner",
      moq: offer?.moq,
      paymentMethodId,
    });

    if (offerIdParam) {
      markOfferApplied(offerIdParam);
    }
  }, [
    hydrateProduct,
    isHydrated,
    productId,
    router,
    offerPriceParam,
    offerIdParam,
    paymentParam,
    qtyParam,
    markOfferApplied,
    fetchOffers,
    offers.length,
  ]);

  useEffect(() => {
    if (!isHydrated || !product || !qtyParam) return;
    const qty = Number(qtyParam);
    if (Number.isFinite(qty) && qty > 0) {
      setQuantity(qty);
    }
  }, [isHydrated, product, qtyParam, setQuantity]);

  const summary = getOrderSummary();

  const handleSubmit = async (data: PurchaseRequestFormData) => {
    if (!product) return;
    setForm(data);
    const result = await useCartStore
      .getState()
      .addItem(
        product.id,
        data.quantityMt,
        data.packaging,
        offerIdParam ?? undefined,
      );
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Added to cart — continue to checkout");
    router.push(ROUTES.checkout);
  };

  if (!isHydrated || !product || !summary) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  const fromOffer = Boolean(offerIdParam);

  return (
    <PageContainer>
      <PageHeader
        title="Create Purchase Request"
        description={
          fromOffer
            ? "Auto-filled from marketplace offer — confirm quantity, packaging and delivery."
            : "Configure quantity, packaging, delivery and addresses for this material."
        }
        breadcrumbs={
          fromOffer
            ? [
                { label: "Marketplace", href: ROUTES.marketplace },
                {
                  label: "Offer Details",
                  href: `${ROUTES.marketplaceOfferDetail}/${offerIdParam}`,
                },
                { label: "Create Purchase Request" },
              ]
            : [
                { label: "Marketplace", href: ROUTES.marketplace },
                { label: "Purchase Requests", href: ROUTES.purchaseRequests },
                { label: "Create" },
              ]
        }
      />

      <PurchaseRequestStepper currentStep="create" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          {fromOffer && offerIdParam ? (
            <AppliedOfferSummary
              offerId={offerIdParam}
              quantityMt={form.quantityMt}
            />
          ) : null}
          <PurchaseRequestForm
            product={product}
            defaultValues={form}
            onSubmit={handleSubmit}
          />
        </div>
        <OrderSummary
          product={product}
          summary={summary}
          paymentMethodId={selectedPaymentMethodId}
        />
      </motion.div>
    </PageContainer>
  );
}
