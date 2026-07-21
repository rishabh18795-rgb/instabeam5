# InstaBeam — Website

Production codebase for **instabeam.site** — "One Signal. Full Funnel."

Built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS
v4. This README documents the current state (**Phase 1 — Foundation**) and
the full build roadmap.

---

## Project status: Phase 1 of 4

This project ships in four verified phases (see `docs/roadmap.md` for the
full breakdown). Each phase is tested, linted, type-checked, and built
clean before moving to the next.

| Phase | Scope | Status |
|---|---|---|
| **1. Foundation** | Branding, homepage, navigation, footer, contact page + working enquiry form, SEO baseline, CI, Vercel-ready config | ✅ Done |
| **2. Business Website** | Service pages, pricing, case studies, about, blog, full SEO, schema | ✅ Done |
| **3. Backend & Admin** | Resend email on every form, Supabase CRM (`leads` table), password-protected `/admin` dashboard (search/filter/pagination/CSV export/status/notes/delete), WhatsApp follow-up CTA | ✅ Done — this codebase |
| 4. Final Polish | Performance/accessibility pass, security review, full CI/CD | Ongoing |

**What's real right now:** every page in this repo is live content — no
Lorem Ipsum, no dummy routes. Navigation only links to pages that exist
(home page sections + `/contact` + `/legal/*`); Phase 2 will introduce
dedicated `/services/[slug]`, `/case-studies`, `/blog`, etc.

---

## Tech stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **UI:** React 19, TypeScript, Tailwind CSS v4 (CSS-first `@theme` config)
- **Animation:** Framer Motion (component-level), GSAP (installed, reserved
  for Phase 2 scroll-driven sequences)
- **Forms/validation:** react-hook-form + Zod, honeypot + rate limiting
- **Email:** Resend (transactional enquiry notifications + confirmations)
- **CRM:** Supabase (Postgres) — every submission is inserted into the
  `leads` table independent of email delivery
- **Admin:** `/admin` — signed-cookie password auth (no external provider),
  full leads dashboard
- **Icons:** lucide-react
- **Planned (Phase 4):** Cloudinary media library, NextAuth (if multi-user
  admin access is ever needed), GA4 analytics dashboard
- **Hosting:** Vercel

---

## Getting started (local development)

**Requirements:** Node.js 20+, npm 10+.

```bash
git clone <your-repo-url> instabeam
cd instabeam
npm install
cp .env.example .env.local   # then fill in RESEND_API_KEY (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build (also runs lint + type check) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint (flat config, `next/core-web-vitals` + `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |

---

## Environment variables

See `.env.example` for the full, commented list.

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | For working email | Get a key at [resend.com](https://resend.com), verify the `instabeam.site` sending domain, then set this. |
| `ENQUIRY_NOTIFY_EMAIL` | No (defaults to `help.instabeam@gmail.com`) | Where new enquiry/newsletter notifications are delivered |
| `ENQUIRY_FROM_EMAIL` | No | The "from" address for outbound mail — must be on a Resend-verified domain |
| `SUPABASE_URL` | For the CRM/admin panel | Project URL from Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | For the CRM/admin panel | Server-only key — never exposed to the client |
| `ADMIN_PASSWORD` | For `/admin` login | Password required to sign in |
| `ADMIN_SESSION_SECRET` | For `/admin` login | Random secret signing the session cookie — generate with `openssl rand -hex 32` |

**Every form submission is inserted into the Supabase `leads` table and
emailed independently** — a failure in one channel never blocks the other,
and the visitor never sees a "not configured" error. Run
`supabase/migrations/0001_create_leads.sql` against your Supabase project
before setting the CRM env vars.

Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set, `/admin` shows a
load error but the public site and email delivery are unaffected. Without
`RESEND_API_KEY` set, leads are still captured in Supabase but no email is
sent (logged server-side).

---

## Deploying

### Recommended: Vercel + GitHub integration

This is the standard, zero-config path and what the domain connection
instructions below assume.

1. **Push this repo to GitHub.**
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```
2. **Import into Vercel:** [vercel.com/new](https://vercel.com/new) → Import
   Git Repository → select this repo. Vercel auto-detects Next.js — no
   build configuration needed.
3. **Set environment variables** in Vercel → Project → Settings →
   Environment Variables → add `RESEND_API_KEY` (and the other optional
   ones) for both **Production** and **Preview**.
4. **Deploy.** Vercel builds and deploys automatically. Every subsequent
   push to `main` redeploys production automatically; every PR gets its own
   preview URL.

### Connecting the instabeam.site domain

1. In Vercel → Project → Settings → Domains, add `instabeam.site` (and
   `www.instabeam.site` if desired, with a redirect to the apex or vice
   versa).
2. Vercel shows the DNS records to add. At your domain registrar / DNS
   provider:
   - For the apex domain (`instabeam.site`): add an **A record** pointing
     to `76.76.21.21` (Vercel's anycast IP — Vercel will display the
     current value to use, confirm against what's shown in your dashboard).
   - For `www`: add a **CNAME record** pointing to `cname.vercel-dns.com`.
3. Wait for DNS propagation (usually minutes, can take up to 48h) — Vercel
   auto-issues an SSL certificate once the records resolve.

### GitHub Actions (CI)

`.github/workflows/ci.yml` runs lint, type-check, and a production build on
every push and pull request against `main`. This is a quality gate, not the
deploy mechanism — deploys are handled by Vercel's Git integration above.
If you'd rather deploy via GitHub Actions instead of Vercel's native
integration, use the [Vercel CLI Action](https://vercel.com/docs/deployments/git/vercel-for-github)
with a `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repo secret
— not required for the default setup.

---

## Project architecture

```
src/
  app/                    # App Router routes
    layout.tsx            # Root layout — metadata, JSON-LD, Navbar/Footer shell
    page.tsx               # Homepage — assembles src/components/home/* sections
    globals.css            # Design tokens (Tailwind v4 @theme) + global styles
    icon.svg                # Auto favicon (Next.js file convention)
    opengraph-image.tsx     # Generated social share card (next/og)
    sitemap.ts / robots.ts  # SEO file-convention routes
    contact/page.tsx        # Contact page
    legal/privacy/page.tsx  # Privacy policy
    legal/terms/page.tsx    # Terms of service
    admin/page.tsx          # Leads dashboard (client-rendered, session-gated)
    admin/login/page.tsx    # Admin password login
    api/enquiry/route.ts    # POST — validates, inserts lead, emails enquiry
    api/newsletter/route.ts # POST — validates, inserts lead, emails signup
    api/admin/login|logout/route.ts   # Session cookie issue/clear
    api/admin/leads/route.ts          # GET (list) / PATCH (status,notes) / DELETE
    api/admin/leads/export/route.ts   # CSV export

  middleware.ts            # Gates /admin and /api/admin behind the session cookie

  components/
    brand/Logo.tsx          # Live SVG logo (mark + wordmark)
    graphics/                # Custom illustrations — AuroraBackground,
                              # GridPattern, FunnelIllustration (all
                              # hand-built SVG/CSS, zero stock imagery)
    layout/                  # Navbar, Footer, WhatsAppButton, ConditionalChrome
    ui/                      # Button, Container, SectionHeading, Toast — shared
                              # primitives used across every page
    home/                    # Homepage sections (Hero, ServicesGrid, ...)
    contact/ContactForm.tsx  # react-hook-form + Zod client form
    shared/WhatsAppCta.tsx   # Post-submit "Chat on WhatsApp" CTA

  lib/
    site-config.ts    # Single source of truth for copy (services, process
                        # steps, FAQ, stats) — seeds the Phase 3 database
    validations.ts     # Zod schemas shared by client + API route
    email.ts           # Resend client + email templates
    supabase.ts         # Service-role Supabase client + leads CRUD
    admin-auth.ts        # Signed session cookie (HMAC) + password check
    request-meta.ts       # IP / User-Agent / referrer / timestamp capture
    utils.ts            # cn() class-merging helper

supabase/migrations/     # SQL — leads table schema
public/logo/            # Flat SVG brand assets (see docs/brand-guidelines.md)
docs/                    # Brand guidelines, roadmap
.github/workflows/       # CI
```

**Content model:** Phase 1 hard-codes all copy in `src/lib/site-config.ts`
so the site ships with zero placeholder content. In Phase 3, the Admin
Portal reads/writes the same shape from Postgres via Prisma, and
`site-config.ts` becomes the seed/fallback data rather than the sole
source — no component code changes required.

**Design system:** all brand tokens (colors, spacing, motion easing) live as
CSS custom properties in `src/app/globals.css` and are wired into Tailwind
v4's `@theme inline` block, so `bg-ink`, `text-beam-600`, `rounded-lg` etc.
are generated directly from the same source of truth documented in
`docs/brand-guidelines.md`.

---

## Performance & SEO notes

- **Fonts:** system font stack by default (zero render-blocking font
  requests). See `docs/brand-guidelines.md` for how to swap in a licensed
  display font via `next/font/local` once one is chosen.
- **Images:** `next/image` configured for AVIF/WebP with a Cloudinary
  remote pattern pre-wired for Phase 3 media uploads.
- **Metadata:** full Open Graph + Twitter Card + JSON-LD `Organization`
  schema in `layout.tsx`; per-page canonical URLs and titles.
- **`sitemap.xml` / `robots.txt`:** generated from `src/app/sitemap.ts` /
  `robots.ts` — update the `routes` array as new pages ship.
- **Security headers:** `next.config.ts` sets `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and a restrictive
  `Permissions-Policy`.
- **Lighthouse target:** 90+ across Performance/Accessibility/Best
  Practices/SEO is a Phase 4 gate — Phase 1 is already built with that bar
  in mind (minimal JS on the server-rendered marketing sections, no layout
  shift from fonts/images, semantic HTML, visible focus states).

---

## License

Proprietary — © InstaBeam. All rights reserved.
