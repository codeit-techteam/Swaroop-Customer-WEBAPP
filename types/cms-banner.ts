export type CmsBannerPlacement =
  "HOME_HERO" | "MARKETPLACE" | "DASHBOARD" | "OFFERS" | "LOGIN" | "OTHER";

export type CmsBannerEvent = "IMPRESSION" | "CLICK";

export type CmsBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  placement: CmsBannerPlacement;
  platform?: string;
  displayOrder?: number;
  mediaKey?: string | null;
  mediaUrl?: string | null;
  /** Resolved mobile creative from Admin (falls back to mediaUrl). */
  mobileMediaUrl?: string | null;
  targetRoute?: string | null;
  ctaText?: string | null;
  ctaAction?: string | null;
  badge?: string | null;
  description?: string | null;
  externalUrl?: string | null;
  targetId?: string | null;
  priority?: number;
};
