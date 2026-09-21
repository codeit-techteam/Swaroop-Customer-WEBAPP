import { fetchMarketplaceCatalog } from "@/services/catalog";
import { fetchCustomerPurchaseRequests } from "@/services/purchase-requests";
import {
  fetchCustomerPayments,
  fetchCustomerProformas,
  fetchCustomerPurchaseOrders,
} from "@/services/finance";
import { fetchCustomerCreditLimit, applyCustomerCredit } from "@/services/credit";
import { fetchCustomerShipments } from "@/services/logistics";
import { fetchCustomerDocuments, fetchCustomerBanners } from "@/services/operations";
import { createCustomerQuote, placeCustomerPurchaseRequest } from "@/services/checkout";

export const marketplaceService = {
  getCatalog: () => fetchMarketplaceCatalog(),
};

export const purchaseRequestService = {
  list: () => fetchCustomerPurchaseRequests(),
};

export const ordersService = {
  list: () => fetchCustomerPurchaseOrders(),
};

export const paymentsService = {
  list: () => fetchCustomerPayments(),
  proformas: () => fetchCustomerProformas(),
};

export const creditService = {
  getLimit: () => fetchCustomerCreditLimit(),
  apply: applyCustomerCredit,
};

export const documentsService = {
  list: () => fetchCustomerDocuments(),
};

export const shipmentTrackingService = {
  list: () => fetchCustomerShipments(),
};

export const checkoutService = {
  quote: createCustomerQuote,
  place: placeCustomerPurchaseRequest,
};
