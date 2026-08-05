/**
 * Service layer placeholders — ready for future API integration.
 * No live network calls in the foundation phase.
 */

export const authService = {
  // login, logout, refreshToken — future
};

export const dashboardService = {
  // getMetrics, getRecentOrders — future
};

export const marketplaceService = {
  // getProducts, getCategories — future
};

export const ordersService = {
  // list, getById — future
};

export const paymentsService = {
  // list, getHistory — future
};

export const documentsService = {
  // list, download, preview — wired via documentsStore (frontend state)
};

export const shipmentTrackingService = {
  // list, getById, documents — future
};

export const notificationsService = {
  // list, markRead, preferences — wired via notificationsCatalogStore (frontend state)
};

export const profileService = {
  // get, update, contacts, banks — wired via profileStore (frontend state)
};

export const supportService = {
  // listTickets, createTicket, chat — wired via supportStore (frontend state)
};
