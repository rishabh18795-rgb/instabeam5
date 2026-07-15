# Build Roadmap

Four phases, each shipped complete — tested, linted, type-checked, built
clean, and deployed — before the next one starts.

## Phase 1 — Foundation ✅ (this codebase)

- Premium UI/UX design system (color, type, motion, spacing tokens)
- Original brand identity: SVG logo (mark, badge, horizontal lockups,
  favicon), custom illustrations, no stock imagery
- Homepage: Hero, Why InstaBeam, Services, Process, Stats + Ebook, FAQ,
  Final CTA
- Responsive navigation with mobile menu
- Footer with real contact info and links
- Fully responsive (mobile-first) layout throughout
- Framer Motion scroll/entrance animations, reduced-motion support
- Contact page with a working enquiry form: client + server (Zod)
  validation, honeypot spam protection, basic rate limiting, Resend email
  delivery (notification + confirmation), clear degraded-mode messaging
  when `RESEND_API_KEY` isn't set
- SEO baseline: metadata, Open Graph/Twitter cards (generated social image),
  JSON-LD Organization schema, `sitemap.xml`, `robots.txt`, security headers
- GitHub Actions CI (lint, typecheck, build) and Vercel-ready configuration
- Privacy Policy and Terms of Service (real, InstaBeam-specific — not
  boilerplate placeholders)

## Phase 2 — Business Website (next)

- Dedicated `/services/[slug]` landing pages for each of the four services,
  each with its own SEO metadata, process detail, and CTA
- `/pricing` — real packages/pricing tiers
- `/about` and `/team`
- `/case-studies` — index + individual case study pages (populated via the
  Admin Portal once Phase 3 ships; until then, ships with an honest "Add
  your success story" empty state rather than invented client data)
- `/blog` — index + article pages. Initial articles are original,
  educational, factually-grounded content (e.g. GA4 setup basics, WhatsApp
  API for e-commerce, funnel audit checklist) — no fabricated case studies
- Testimonials section wired the same way as case studies — real quotes
  only, empty state until populated
- Full technical + on-page SEO across every new route, expanded schema
  markup (Service, FAQPage, BreadcrumbList), expanded `sitemap.ts`

## Phase 3 — Backend & Admin Portal

- Supabase (Postgres) + Prisma schema covering: services, blog posts, case
  studies, testimonials, pricing plans, enquiries, FAQs, SEO settings, media
- NextAuth-based authentication for `/admin`
- Admin Dashboard: CRUD for every content type above, enquiry inbox with
  status tracking, SEO settings editor, media library backed by Cloudinary
- `src/lib/site-config.ts` becomes seed/fallback data; pages read from the
  database with ISR/ on-demand revalidation
- Enquiry emails continue via Resend; submissions are now also persisted
  and visible in the Admin Portal
- Basic analytics (page views, enquiry conversion) surfaced in the Admin
  Dashboard; `NEXT_PUBLIC_GA_MEASUREMENT_ID` wired for GA4

## Phase 4 — Final Polish

- Performance pass: bundle analysis, dynamic imports for below-the-fold
  sections, image optimization audit
- Accessibility audit (axe, manual keyboard/screen-reader pass)
- Cross-browser/device testing
- Lighthouse 90+ on Performance, Accessibility, Best Practices, and SEO —
  verified and recorded
- Security review (headers, dependency audit, admin auth hardening, rate
  limiting on all mutating endpoints)
- Full CI/CD: CI gate (already in place from Phase 1) + automated
  production deploy on merge to `main`
- Final documentation pass and QA sign-off
