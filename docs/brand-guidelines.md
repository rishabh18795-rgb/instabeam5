# InstaBeam Brand Guidelines

## Concept

The mark is two beams converging from a wide signal into a single point —
literally "one signal, full funnel." It reads simultaneously as a signal
(radiating outward) and a funnel (narrowing to conversion), which is the
entire InstaBeam pitch in one shape.

It's implemented as live SVG/React (`src/components/brand/Logo.tsx`), not a
raster image, so it's perfectly crisp at any size, themeable via CSS
variables, and animatable. Flat exports for places that need a static file
(favicons, social platforms, docs, partner decks) live in `/public/logo`.

## Assets

| File | Use |
|---|---|
| `public/logo/mark.svg` | Standalone gradient mark, transparent background |
| `public/logo/mark-badge-dark.svg` | Mark on an ink rounded-square badge — app icons, favicon, dark surfaces |
| `public/logo/mark-badge-light.svg` | Mark on a white rounded-square badge — light surfaces, partner listings |
| `public/logo/lockup-horizontal.svg` | Mark + wordmark, dark text — light backgrounds |
| `public/logo/lockup-horizontal-dark.svg` | Mark + wordmark, white text — dark backgrounds |
| `src/app/icon.svg` | Next.js auto-favicon (App Router file convention) |
| `src/app/opengraph-image.tsx` | Social share card, generated at request time from brand tokens |

**Clear space:** keep at least the height of the mark itself as empty space
on all sides. **Minimum size:** don't render the mark below 20px — at that
size use the badge variant, not the bare gradient stroke.

**Don't:** recolor the mark outside the defined gradient, stretch it
non-uniformly, add a drop shadow, or place it on a busy photographic
background without the badge.

## Color

| Token | Hex | Tailwind utility | Use |
|---|---|---|---|
| Ink | `#0B0B0B` | `bg-ink` / `text-ink` | Primary text, dark sections, primary buttons |
| Paper | `#FFFFFF` | `bg-paper` / `text-paper` | Base background, text on dark |
| Beam | `#00D9FF` | `bg-beam` / `text-beam` | Primary accent — links, focus states, gradient start |
| Gold | `#F4B400` | `bg-gold` / `text-gold` | Secondary accent — highlights, gradient end, sparingly |

Supporting neutral scale (`mist-50`…`mist-950`) and tint scales
(`beam-50…700`, `gold-100…700`) are defined as CSS custom properties in
`src/app/globals.css` under `:root` and wired into Tailwind v4 via the
`@theme inline` block, so any `--color-*` token is usable directly as a
utility class (e.g. `bg-mist-100`, `text-beam-600`).

Accent colors (beam, gold) are used deliberately and sparingly — as gradient
accents, focus rings, and small UI details — never as large background
fills, to keep the palette premium rather than loud.

## Typography

Phase 1 ships with a system font stack (`--font-sans` in `globals.css`:
`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, ...`) rather
than a hosted webfont. This is a deliberate performance choice — zero
render-blocking font requests, zero layout shift, zero third-party
dependency — and it still reads clean and modern.

**Upgrading to a licensed display font:** once a typeface is chosen (Inter,
General Sans, Geist, etc. are all good fits for this brand), self-host it
with `next/font/local`:

1. Drop the `.woff2` files in `src/assets/fonts/`.
2. In `src/app/layout.tsx`, replace the system stack with:
   ```ts
   import localFont from "next/font/local";
   const sans = localFont({ src: "../assets/fonts/YourFont-Variable.woff2", variable: "--font-sans" });
   ```
3. Apply `sans.variable` on the `<html>` element as already scaffolded for
   the previous Geist setup.

Type scale: headings use `font-display` (currently aliased to the same
system stack) at `font-semibold`, tight tracking (`tracking-tight`), and
`text-balance` for wrapping. Body copy uses `font-sans` at `leading-relaxed`.

## Motion

- Section reveals: fade + 16–24px translate-y, `ease: [0.16, 1, 0.3, 1]`
  ("expo-out"), 0.5–0.7s, staggered ~0.08s per item.
- Backgrounds: slow (18–24s) looping aurora-gradient drift — see
  `AuroraBackground.tsx` — never fast or attention-grabbing.
- All motion respects `prefers-reduced-motion` (handled globally in
  `globals.css`).

## Voice

Direct, specific, numbers-first. InstaBeam explains what it does in plain
language ("the site that converts, the ads that bring traffic...") rather
than marketing abstraction, and backs claims with real figures (2,350+
leads, 15.69x ROAS) instead of vague superlatives.
