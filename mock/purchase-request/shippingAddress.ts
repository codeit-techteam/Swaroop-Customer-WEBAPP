import type { ShippingAddress } from "@/types/purchase-request";

/** Default shipping / delivery hub — mirrors SWAROOP `DEFAULT_CHECKOUT_ADDRESS_ID`. */
export const DEFAULT_SHIPPING_ADDRESS_ID = "jamnagar-hub";

/**
 * Shipping / delivery locations — mirrors SWAROOP `CHECKOUT_ADDRESSES`.
 * Freight is address-based (not cart quantity tiers) at checkout/PR stage.
 */
export const shippingAddressesMock: ShippingAddress[] = [
  {
    id: "jamnagar-hub",
    warehouseName: "Jamnagar Logistics Hub",
    line1: "Plot No. 42, GIDC Industrial Estate",
    line2: "Jamnagar",
    state: "Gujarat",
    pincode: "361001",
    zoneLabel: "Primary Industrial Zone",
    cityShort: "Jamnagar",
    freightAmount: 12400,
    etaLabel: "2–3 Business Days",
  },
  {
    id: "mumbai-warehouse",
    warehouseName: "Mumbai Warehouse",
    line1: "Unit 7, Taloja Industrial Area",
    line2: "Navi Mumbai",
    state: "Maharashtra",
    pincode: "410208",
    zoneLabel: "Western Logistics Corridor",
    cityShort: "Mumbai",
    freightAmount: 14800,
    etaLabel: "2–4 Business Days",
  },
  {
    id: "hazira-hub",
    warehouseName: "Hazira Industrial Hub",
    line1: "Sector 12, Hazira Industrial Estate",
    line2: "Surat",
    state: "Gujarat",
    pincode: "394270",
    zoneLabel: "Gujarat Industrial Belt",
    cityShort: "Hazira",
    freightAmount: 13600,
    etaLabel: "3–4 Business Days",
  },
  {
    id: "mundra-port",
    warehouseName: "Mundra Port",
    line1: "Adani Port & SEZ, Mundra",
    line2: "Kutch",
    state: "Gujarat",
    pincode: "370421",
    zoneLabel: "Coastal Export Zone",
    cityShort: "Mundra",
    freightAmount: 16200,
    etaLabel: "4–5 Business Days",
  },
];

export const getShippingAddressById = (id: string): ShippingAddress =>
  shippingAddressesMock.find((entry) => entry.id === id) ??
  shippingAddressesMock[0];
