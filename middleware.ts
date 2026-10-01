import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTE_PREFIXES, ROUTES } from "@/constants";
import { ONBOARDING_COMPLETE_COOKIE } from "@/lib/onboarding-cookie";
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

function isOnboardingRoute(pathname: string): boolean {
  return (
    pathname === ROUTES.onboarding ||
    pathname.startsWith(`${ROUTES.onboarding}/`) ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  );
}

function postAuthDestination(request: NextRequest): string {
  const flag = request.cookies.get(ONBOARDING_COMPLETE_COOKIE)?.value;
  // Explicit incomplete only — missing cookie means legacy / unrestricted
  if (flag === "0") return ROUTES.onboarding;
  return ROUTES.dashboard;
}

/**
 * Mock auth middleware — reads the client-set auth cookie.
 * Enable with NEXT_PUBLIC_ENABLE_AUTH_GUARD=true (default for auth module).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(env.authCookieName)?.value;
  const isAuthenticated = Boolean(token);
  const onboardingFlag = request.cookies.get(ONBOARDING_COMPLETE_COOKIE)?.value;
  const onboardingIncomplete = onboardingFlag === "0";
  const onboardingCompleted = onboardingFlag === "1";

  // Always guard auth module routes + protected app routes when enabled
  const enableAuthGuard = env.enableAuthGuard;

  if (!enableAuthGuard) {
    // Still redirect legacy /auth → /login and /onboarding alias
    if (pathname === ROUTES.auth) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      return NextResponse.redirect(new URL(ROUTES.onboarding, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    return NextResponse.redirect(new URL(ROUTES.onboarding, request.url));
  }

  if (pathname === ROUTES.home) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }
    return NextResponse.redirect(
      new URL(postAuthDestination(request), request.url),
    );
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Incomplete onboarding cannot access protected app modules
  if (
    isAuthenticated &&
    onboardingIncomplete &&
    isProtectedRoute(pathname) &&
    !isOnboardingRoute(pathname)
  ) {
    return NextResponse.redirect(new URL(ROUTES.onboarding, request.url));
  }

  // Completed users should not stay in the onboarding wizard
  if (isAuthenticated && onboardingCompleted && isOnboardingRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if (
    isAuthRoute(pathname) &&
    isAuthenticated &&
    pathname !== ROUTES.otpVerification &&
    !pathname.startsWith(ROUTES.forgotPassword) &&
    pathname !== ROUTES.resetPassword &&
    pathname !== ROUTES.passwordResetSuccess
  ) {
    return NextResponse.redirect(
      new URL(postAuthDestination(request), request.url),
    );
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
    "/onboarding",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/marketplace/:path*",
    "/product/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/payments/:path*",
    "/orders/:path*",
    "/shipment-tracking/:path*",
    "/documents/:path*",
    "/profile/:path*",
    "/support/:path*",
    "/settings/:path*",
    "/purchase-requests/:path*",
    "/import/:path*",
    "/customer/:path*",
  ],
};
