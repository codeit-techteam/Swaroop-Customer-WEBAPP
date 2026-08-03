import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTE_PREFIXES, ROUTES } from "@/constants";
import { env } from "@/lib/env";

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Mock auth middleware — reads the client-set auth cookie.
 * Enable with NEXT_PUBLIC_ENABLE_AUTH_GUARD=true (default for auth module).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(env.authCookieName)?.value;
  const isAuthenticated = Boolean(token);

  // Always guard auth module routes + protected app routes when enabled
  const enableAuthGuard = env.enableAuthGuard;

  if (!enableAuthGuard) {
    // Still redirect legacy /auth → /login
    if (pathname === ROUTES.auth) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === ROUTES.home) {
    const dest = isAuthenticated ? ROUTES.dashboard : ROUTES.login;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isAuthRoute(pathname) &&
    isAuthenticated &&
    pathname !== ROUTES.otpVerification &&
    !pathname.startsWith(ROUTES.forgotPassword) &&
    pathname !== ROUTES.resetPassword &&
    pathname !== ROUTES.passwordResetSuccess
  ) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth",
    "/login",
    "/register",
    "/otp-verification",
    "/forgot-password",
    "/forgot-password/:path*",
    "/reset-password",
    "/password-reset-success",
    "/dashboard/:path*",
    "/marketplace/:path*",
    "/product/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/payments/:path*",
    "/orders/:path*",
    "/shipment-tracking/:path*",
    "/documents/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/support/:path*",
    "/settings/:path*",
    "/purchase-requests/:path*",
    "/customer/:path*",
  ],
};
