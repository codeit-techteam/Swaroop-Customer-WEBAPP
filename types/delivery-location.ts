export type DeliveryLocationSource = "saved" | "gps" | "pincode" | "manual";

/**
 * Selected delivery destination for shopping / checkout.
 * Distinct from a Purchase Request's immutable shipping snapshot.
 */
export type DeliveryLocation = {
  id: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  source: DeliveryLocationSource;
  addressId?: string | null;
  line1?: string;
  line2?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Display badge in header (CURRENT / HOME / OFFICE / …). */
  badge?: string;
};

export type SelectedDeliveryAddress = {
  source: "CURRENT_LOCATION" | "SAVED_ADDRESS";
  addressId: string | null;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
};
