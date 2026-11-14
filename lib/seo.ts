import type { Metadata } from "next";
import { APP_NAME, PROTECTED_ROUTE_PREFIXES, ROUTES } from "@/constants";
import { env } from "@/lib/env";

/**
 * Canonical Customer Portal host.
 * Prefer customer.polystorex.com (DNS + TLS verified 14 Nov 2026).
 * Interim Vercel host remains a valid origin but must not win the canonical
 * when the custom domain is available via env or as the production default.
 */
export const PRODUCTION_APP_URL = "https://customer.polystorex.com";
/** Known interim host — accepted in CORS, never preferred for SEO canonicals. */
export const INTERIM_APP_URL = "https://swaroop-customer-webapp.vercel.app";

const DEFAULT_DESCRIPTION =
  "PolyStoreX Customer Web Portal — browse grades, live offers and procure industrial materials.";
const DEFAULT_OG_IMAGE = "/brand/polystorex-og.png";

export const PUBLIC_SITEMAP_PATHS = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.marketplace,
  ROUTES.marketplaceGrades,
] as const;

/** Canonical origin for sitemap, robots, and Open Graph — never localhost. */
export function publicSiteOrigin(): string {
  const raw = (env.appUrl ?? "").replace(/\/$/, "");
  if (!raw || raw.includes("localhost") || raw.includes("127.0.0.1")) {
    return PRODUCTION_APP_URL;
  }
  // Prefer the production custom domain over interim Vercel preview host.
  if (raw.includes(".vercel.app")) {
    return PRODUCTION_APP_URL;
  }
  return raw;
}

/** Host header for robots.txt (hostname only, no scheme). */
export function publicSiteHost(): string {
  try {
    return new URL(publicSiteOrigin()).host;
  } catch {
    return "customer.polystorex.com";
  }
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${publicSiteOrigin()}${normalized}`;
}

type PageMetaOptions = {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex,
}: PageMetaOptions): Metadata {
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const canonical = absoluteUrl(path);
  const ogImage = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      locale: "en_IN",
      url: canonical,
      title: pageTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: APP_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function rootMetadata(): Metadata {
  const canonical = absoluteUrl("/marketplace");

  return {
    title: {
      default: env.appName,
      template: `%s | ${env.appName}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: env.appName,
    metadataBase: new URL(publicSiteOrigin()),
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: env.appName,
      locale: "en_IN",
      url: canonical,
      title: env.appName,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: env.appName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: env.appName,
      description: DEFAULT_DESCRIPTION,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    icons: {
      icon: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

/** Paths that must not appear in the sitemap or search index. */
export function robotsDisallowPaths(): string[] {
  const extra = [
    ROUTES.home,
    ROUTES.otpVerification,
    ROUTES.resetPassword,
    ROUTES.passwordResetSuccess,
    `${ROUTES.forgotPassword}/otp`,
    "/api",
  ];
  return [...new Set([...PROTECTED_ROUTE_PREFIXES, ...extra])];
}
