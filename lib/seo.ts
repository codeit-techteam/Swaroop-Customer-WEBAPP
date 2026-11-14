import type { Metadata } from "next";
import { APP_NAME, PROTECTED_ROUTE_PREFIXES, ROUTES } from "@/constants";
import { env } from "@/lib/env";

/** Production Customer Portal host — used when env still points at localhost. */
export const PRODUCTION_APP_URL = "https://swaroop-customer-webapp.vercel.app";

const DEFAULT_DESCRIPTION =
  "PolyStoreX Customer Web Portal — desktop companion to the PolyStoreX Customer Mobile App.";
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
  return raw;
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
          url: image.startsWith("http") ? image : absoluteUrl(image),
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
      images: [image.startsWith("http") ? image : absoluteUrl(image)],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function rootMetadata(): Metadata {
  const canonical = absoluteUrl("/login");

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
