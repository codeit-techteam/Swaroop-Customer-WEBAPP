export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "PetroTrade Customer Portal",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1",
  refreshTokenStorageKey:
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY ?? "pt_customer_refresh",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
  authCookieName:
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "pt_customer_token",
  enableAuthGuard: process.env.NEXT_PUBLIC_ENABLE_AUTH_GUARD === "true",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  enableWebSockets: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === "true",
  enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true",
  cxApiUrl: process.env.NEXT_PUBLIC_CX_API_URL ?? "http://localhost:3000",
  adminApiUrl: process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:3002",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
