import type { ImportParty, ImportSide } from "@/types/import";

/**
 * Customer Web trades the BUY side of Import: it publishes BUY requests (RFQs)
 * and browses SELL offers. The backend enforces the same rule from the session.
 */
export const IMPORT_OWN_SIDE: ImportSide = "BUY";
export const IMPORT_MARKET_SIDE: ImportSide = "SELL";
export const IMPORT_OWN_PARTY: ImportParty = "BUYER";

export const IMPORT_COPY = {
  own: "Buy request",
  ownPlural: "Buy requests",
  ownLong: "Import buy request (RFQ)",
  market: "Sell offer",
  marketPlural: "Sell offers",
  price: "Target price",
  quantity: "Required quantity",
  counterparty: "Seller",
} as const;

export const IMPORT_ROUTES = {
  root: "/import",
  mine: "/import/buy",
  create: "/import/buy/new",
  mineDetail: (id: string) => `/import/buy/${id}`,
  edit: (id: string) => `/import/buy/${id}/edit`,
  market: "/import/offers",
  marketDetail: (id: string) => `/import/offers/${id}`,
  negotiations: "/import/negotiations",
  negotiationDetail: (id: string) => `/import/negotiations/${id}`,
  deals: "/import/deals",
  dealDetail: (id: string) => `/import/deals/${id}`,
  shipments: "/import/shipments",
} as const;

/** API path segment for a listing side. */
export const sidePath = (side: ImportSide) =>
  side === "BUY" ? "/import/buy" : "/import/sell";

/** BUY requests close on a server-set date; SELL offers carry seller validity. */
export const validityLabel = (side: ImportSide) =>
  side === "BUY" ? "Open until" : "Valid until";

/** Link to a listing of either side as seen from this app. */
export function listingHref(side: ImportSide, id: string): string {
  return side === IMPORT_OWN_SIDE
    ? IMPORT_ROUTES.mineDetail(id)
    : IMPORT_ROUTES.marketDetail(id);
}
