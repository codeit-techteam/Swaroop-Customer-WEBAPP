# Accessibility (PolyStoreX Customer Web Portal)

## Quick wins applied (P2)

- Icon-only controls: `aria-label` added on shared navigation, cart, checkout, chat, and upload flows where labels were missing.
- Brand auth hero: stat labels use higher-contrast `text-white/80` on the dark industrial backdrop.

## Phase 3 updates (14 Nov 2026)

- Global `:focus-visible` ring in `styles/globals.css` (keyboard focus visibility).
- Marketplace sort control: visible `<label>` + `aria-label` on the trigger; muted label contrast raised to `text-slate-600`.
- Marketplace search already exposes `aria-label`, combobox roles, and listbox keyboard navigation.
- Logo mark on Website now has meaningful `alt="PolyStoreX"` (was empty + aria-hidden).
- Mobile Market: Filter/Sort touch targets ≥40×44; toolbar exposes `accessibilityRole="toolbar"`.

## Full audit (remaining)

A complete WCAG 2.2 AA pass (165+ checklist items) is **not** certified in-repo. Run **axe DevTools** against production Customer Portal after Vercel deploy (guest + authenticated).

Do not treat this document as certification.
