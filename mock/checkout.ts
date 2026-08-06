import type { CheckoutAddress } from "@/store/checkoutStore";

/** Blind marketplace delivery destinations — no seller/supplier identity */
export interface DeliveryLocationOption {
  id: string;
  name: string;
  address: string;
  state: string;
  pincode: string;
  receiverName: string;
  phone: string;
  regionLabel: string;
  estimatedFreightPerMt: number;
}

export const deliveryLocationsMock: DeliveryLocationOption[] = [
  {
    id: "mumbai-plant",
    name: "Mumbai Plant",
    address: "Unit 7, Taloja Industrial Area, Navi Mumbai",
    state: "Maharashtra",
    pincode: "410208",
    receiverName: "Plant Stores",
    phone: "+91 98765 43210",
    regionLabel: "Western India Region",
    estimatedFreightPerMt: 310,
  },
  {
    id: "ahmedabad-warehouse",
    name: "Ahmedabad Warehouse",
    address: "Plot 18, Vatva GIDC, Ahmedabad",
    state: "Gujarat",
    pincode: "382445",
    receiverName: "Warehouse In-charge",
    phone: "+91 98250 11223",
    regionLabel: "Western India Region",
    estimatedFreightPerMt: 280,
  },
  {
    id: "pune-factory",
    name: "Pune Factory",
    address: "MIDC Chakan, Phase II, Pune",
    state: "Maharashtra",
    pincode: "410501",
    receiverName: "Factory Gate",
    phone: "+91 97654 88901",
    regionLabel: "Western India Region",
    estimatedFreightPerMt: 340,
  },
];

export const shippingBillingAddressesMock: CheckoutAddress[] = [
  {
    id: "mumbai-plant",
    label: "Mumbai Plant",
    line1: "Unit 7, Taloja Industrial Area",
    line2: "Navi Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "410208",
    contactPerson: "Rajesh Mehta",
    phone: "+91 98765 43210",
  },
  {
    id: "ahmedabad-warehouse",
    label: "Ahmedabad Warehouse",
    line1: "Plot 18, Vatva GIDC",
    line2: "Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382445",
    contactPerson: "Priya Shah",
    phone: "+91 98250 11223",
  },
  {
    id: "billing-hq",
    label: "Registered Office",
    line1: "12th Floor, Trade Centre",
    line2: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    contactPerson: "Accounts Desk",
    phone: "+91 22 4000 1200",
  },
];

export function getDeliveryLocationById(id: string) {
  return deliveryLocationsMock.find((l) => l.id === id);
}

export function getCheckoutAddressById(
  id: string,
  custom: CheckoutAddress[] = [],
) {
  return (
    custom.find((a) => a.id === id) ??
    shippingBillingAddressesMock.find((a) => a.id === id)
  );
}

export const GST_RATE = 0.18;

export function computeEstimatedFreight(
  allocations: Array<{ locationId: string; quantityMt: number }>,
): number {
  return allocations.reduce((sum, a) => {
    const loc = getDeliveryLocationById(a.locationId);
    const rate = loc?.estimatedFreightPerMt ?? 300;
    return sum + rate * a.quantityMt;
  }, 0);
}
