import { fetchMarketplaceCatalog } from "@/services/catalog";
import {
  addCustomerCartItem,
  fetchCustomerCart,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "@/services/cart";
import { fetchCustomerPurchaseRequests } from "@/services/purchase-requests";
import {
  fetchCustomerPayments,
  fetchCustomerProformas,
  fetchCustomerPurchaseOrders,
} from "@/services/finance";
import { fetchCustomerCreditLimit, applyCustomerCredit } from "@/services/credit";
import { fetchCustomerShipments } from "@/services/logistics";
import { fetchCustomerDocuments } from "@/services/operations";
import { fetchCustomerBanners } from "@/services/cms";
import {
  createCustomerQuote,
  placeCustomerPurchaseRequest,
  quoteCartForCheckout,
} from "@/services/checkout";

export const cartService = {
  get: fetchCustomerCart,
  addItem: addCustomerCartItem,
  updateItem: updateCustomerCartItem,
  removeItem: removeCustomerCartItem,
};

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

export const cmsService = {
  listBanners: fetchCustomerBanners,
};

export const shipmentTrackingService = {
  list: () => fetchCustomerShipments(),
};

export const checkoutService = {
  quote: createCustomerQuote,
  quoteFromCart: quoteCartForCheckout,
  place: placeCustomerPurchaseRequest,
};
