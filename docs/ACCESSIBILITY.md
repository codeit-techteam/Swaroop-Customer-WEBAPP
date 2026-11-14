# Accessibility (PolyStoreX Customer Web Portal)

## Quick wins applied (P2)

- Icon-only controls: `aria-label` added on shared navigation, cart, checkout, chat, and upload flows where labels were missing.
- Brand auth hero: stat labels use higher-contrast `text-white/80` on the dark industrial backdrop.

## Full audit (P3 — after deploy)

A complete WCAG pass (165+ checklist items) is **not** done in-repo. Schedule an **axe DevTools** (or equivalent) scan against the **production** Customer Portal URL after Vercel deploy, with authenticated and guest routes.

Record findings in a follow-up ticket; do not treat this document as certification.
