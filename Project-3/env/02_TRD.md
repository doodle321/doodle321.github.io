# Technical Requirements Document (TRD)
## Roopa Marri Restaurant & Marriage Garden — Website

**Version:** 1.0 | **Date:** September 2026 | **Status:** Draft
**Architecture type:** Fully static frontend — no server, no database, no build-time API

---

## 1. Overview

The site is a **static, client-side-only web application**. All content ships as pre-built HTML/CSS/JS and is served from a static host (or a CDN). There is no backend service to develop, deploy, or secure. The single external integration is the **WhatsApp deep-link API (`wa.me`)** used to forward reservation requests, event enquiries, and delivery orders to the business phone **+92 346 2785955** as pre-drafted messages.

This document defines the stack, integrations, data flow, security posture, and scalability approach.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Markup** | HTML5 (semantic, pre-rendered) | SEO, accessibility, zero-JS resilience for content pages |
| **Styling** | Tailwind CSS (via CDN or pre-built) + custom CSS | Utility consistency, small payload, rapid iteration |
| **Animations** | Vanilla CSS animations + GSAP (ScrollTrigger) for scroll reveals, parallax, hero sequences | Rich "full of life" motion without a framework |
| **Logic** | Vanilla JavaScript (ES2020+, no framework) | Small scope doesn't justify React/Vue; fast load, no hydration cost |
| **Icons** | **SVG vector icons only** (inline `<svg>` sprite or Lucide/Heroicons SVGs) | Requirement: no emojis, crisp at any size, single-color theming |
| **Fonts** | Google Fonts (display + body pairing defined in Design Doc) | Reliable CDN, self-hostable later |
| **Images** | WebP/AVIF with srcset fallbacks; lazy loading. **Menu item images are online-hosted URLs** (public image CDN such as Cloudinary/Imgur/Unsplash source URLs) so identical content loads for every visitor regardless of device; each `<img>` carries an `onerror` fallback to a local SVG placeholder | Performance budget compliance + zero missing-image risk |
| **Data** | Static JSON/JS module (`data/menu.js`, `data/gallery.js`, `data/packages.js`) | Content editable without touching markup |
| **Config** | `config.js` — single source: `BUSINESS_PHONE`, hours, delivery fee, currency format | One place to change the business number |
| **Hosting** | Netlify / Vercel / GitHub Pages / Cloudflare Pages | Free tier static hosting + CDN + HTTPS by default |
| **Version control** | Git (GitHub) | Standard workflow, rollback, PR reviews |
| **Domain/DNS** | Custom domain (e.g., roopamarri.com) + free SSL from host | Professional presence |

### 2.1 Explicitly NOT Used
- No React/Angular/Vue (scope too small; static HTML is faster and simpler to maintain)
- No backend language (Node/PHP/Python)
- No database (SQL/NoSQL)
- No authentication system (no user accounts)
- No form submission endpoints — the message-forwarding integration replaces them entirely
- No emojis anywhere in UI (vector SVG icons per brand requirement)

---

## 3. External Integrations & APIs

### 3.1 WhatsApp Deep-Link API (sole integration)
- **Mechanism:** `https://wa.me/<number>?text=<urlencoded_message>`
- **Usage:** triggered on form submission (reservation, booking enquiry, delivery order) and from contact/floating buttons.
- **Message construction:** Central `buildMessage(type, payload)` utility:
  - `RESERVATION` — name, phone, date, time, guests, occasion, requests
  - `ORDER` — itemized list, quantities, line prices, subtotal, delivery fee, total, customer name/phone/address, payment method, notes
  - `EVENT_ENQUIRY` — package name, event type, date, guest count, name, phone, notes
- **Encoding:** `encodeURIComponent`; line breaks via `%0A`; number stored in international format without `+` (e.g., `923462785955`).
- **Fallback:** If `wa.me` fails to hand off (rare), show the drafted message in a modal with a copy button + tap-to-call alternative.

### 3.2 Google Maps Embed
- Lazy-loaded iframe for the location section; `loading="lazy"`, no API key required for the basic embed.

### 3.3 Google Fonts
- Font loading with `display=swap`, preconnect hints.

### 3.4 Online Image Hosting (menu & gallery assets)
- **What:** All menu-item (and gallery) images are referenced by absolute `https://` URLs stored in the data files — nothing binary ships in the repo for menu content.
- **Recommended host:** Cloudinary free tier (on-the-fly resize/format via URL params, CDN delivery, reliable hot-linking) or, for simplicity, direct Unsplash/Pexels source URLs for stock food photography. Avoid random hot-linking to unknown sites (rate limits, link rot).
- **Why:** Identical experience for every visitor, instant content updates by swapping a URL in `data/menu.js`, no repo bloat.
- **Resilience rule:** Every image element implements `onerror` → swaps to a branded local SVG placeholder (`assets/img/placeholder-dish.svg`) so a dead external link never renders a broken image.
- **Budget:** ≤80KB per menu card image; request `f_auto,q_auto,w_800` transforms if using Cloudinary.

### 3.5 Analytics (optional, privacy-friendly)
- Plausible or GA4 via snippet; no server-side anything.

---

## 4. Application Architecture & Data Flow

```
┌────────────────────────────────────────────────────┐
│                  STATIC FRONTEND                    │
│  ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ index.html │ │ style.css │ │ app.js (modules) │  │
│  └─────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│        └────────────┴────────────────┘             │
│   ┌──────────┐ ┌──────────┐ ┌────────────────┐     │
│   │ data/    │ │ config.js│ │ assets/ (img,  │     │
│   │ menu.js  │ │ (phone,  │ │ svg sprite,    │     │
│   │ packages │ │  hours)  │ │ fonts)         │     │
│   └──────────┘ └──────────┘ └────────────────┘     │
└───────────────┬────────────────────────────────────┘
                │  (no server round-trips)
   ┌────────────▼──────────────┐   ┌──────────────┐
   │ wa.me deep-link handoff   │   │ Google Maps  │
   │ → business phone          │   │ embed iframe │
   └───────────────────────────┘   └──────────────┘
                │
   ┌────────────▼──────────────┐
   │ Business phone (WhatsApp) │
   │ Staff replies to confirm  │
   └───────────────────────────┘
```

### 4.1 Module Map (app.js split into ES modules)
- `config.js` — constants (phone, hours, delivery fee, currency)
- `menu.js` — render menu, category filter, search, add-to-cart
- `cart.js` — cart state (localStorage), drawer UI, totals
- `forms.js` — validation + message building + handoff for all three flows
- `gallery.js` — masonry + lightbox
- `animations.js` — GSAP scroll reveals, counters, hero
- `ui.js` — nav, mobile bar, toasts, modals

### 4.2 Data Flow — Order Example
1. User taps "Add" on a menu item → `cart.add(id)` → state saved to `localStorage` → cart badge updates.
2. Cart drawer opens → quantities adjusted → totals computed from `data/menu.js` prices + `config.deliveryFee`.
3. Checkout form validates (name, PK phone regex `^\+?92\s?\d{10}$` or local format, address non-empty, date ≥ today).
4. `buildMessage('ORDER', payload)` → encoded → `window.open(wa.me URL)`.
5. Success screen renders the same summary locally for the user's records.

---

## 5. Key Technical Details

### 5.1 localStorage Keys
| Key | Contents | TTL/Purpose |
|---|---|---|
| `rm_cart` | `[{id, qty}]` | Until order confirmed or cleared |
| `rm_form_draft` | Last form inputs (reservation/enquiry) | Session convenience |
| `rm_seen_intro` | Boolean | Play hero intro animation once per visit |

### 5.2 Validation Rules (client-side)
- Phone: Pakistani mobile format, normalized before drafting the message.
- Date: today → +180 days (reservations), today → +730 days (events).
- Guests: 1–500 (restaurant, stepper). Event enquiries use a **required dropdown** — `150–250 / 250–350 / 350–500` — sourced from `config.eventGuestOptions`; no free-text guest count for events.
> **Single-source note:** the day-range limits (+180 / +730) and guest caps live in `config.js` (`maxReservationDaysAhead`, `maxEventDaysAhead`) per ADR-5. This table documents their values — change them in `config.js` only, never hardcode in form logic.
- All forms: HTML5 validation + custom messages; no submit without valid state.

### 5.3 Performance Budgets
| Metric | Target |
|---|---|
| First Contentful Paint | ≤ 2.5s (4G, mid-tier phone) |
| Largest Contentful Paint | ≤ 3.5s |
| Total transfer (first load) | ≤ 1.5 MB |
| Hero image | ≤ 250 KB (AVIF/WebP) |
| Time to Interactive | ≤ 4s |
| Lighthouse (mobile) | ≥ 90 Performance, 100 Accessibility |

**Techniques:** minification, image compression (≤80 quality WebP, responsive srcset), lazy loading below the fold, deferred non-critical JS, preconnect to fonts/CDN, minimal third-party scripts.

### 5.4 Animation Performance
- Transform/opacity-only animations (GPU-composited); avoid layout-thrashing properties.
- `prefers-reduced-motion` respected: disable parallax, ken-burns, and auto-carousels.
- GSAP loaded deferred; content fully readable without it (progressive enhancement).

### 5.5 SEO
- Pre-rendered HTML content per section; semantic landmarks; `Restaurant` + `LocalBusiness` JSON-LD schema (name, address, phone, opening hours, servesCuisine, priceRange); Open Graph + Twitter cards; `sitemap.xml`; descriptive alt text on all images.

---

## 6. Security

Even without a backend, these practices apply:

| Area | Measure |
|---|---|
| **No attack surface** | No server code, no database, no auth → no SQLi/XSS-via-server/session hijack vectors. XSS exposure limited to client-only DOM; all user input is text-encoded into message strings via `encodeURIComponent`, never injected as HTML. |
| **HTTPS** | Enforced by host (HSTS) — required for `wa.me` handoff reliability and SEO. |
| **Dependency hygiene** | Pin CDN versions with SRI (Subresource Integrity) hashes; minimal third-party scripts; regular audit of `package.json` if a build step is added. |
| **Privacy** | No cookies, no trackers beyond privacy-friendly analytics (configurable); no personal data stored anywhere — form data lives only in the visitor's own `localStorage` and their messaging app. |
| **Content integrity** | Business number and prices sourced only from `config.js` / `data/` files under version control; changes via reviewed PRs. |
| **WhatsApp link safety** | Phone number is a hardcoded constant, never derived from user input → no message-redirection abuse. |

---

## 7. Scalability & Reliability

- **Traffic scalability:** Static hosting on a global CDN absorbs any realistic traffic spike (wedding season surges, social media features) with zero code changes. No server to scale.
- **Content scalability:** Adding a dish = one entry in `data/menu.js`; adding a package = one object in `data/packages.js`. Non-developers can edit with a one-page cheat sheet.
- **Reliability:** No single point of failure; CDN uptime 99.9%+; if the messaging service is down, tap-to-call remains as fallback.
- **Future-proofing:** If a backend is ever added (payments, availability), the frontend contracts (data file shapes, message formats) are already documented here, making the migration additive rather than a rewrite.

---

## 8. Environments & Workflow

| Environment | Where | Purpose |
|---|---|---|
| Local | Any static server (`npx serve`, VS Code Live Server) | Development |
| Preview | Netlify/Vercel deploy previews per PR | Review & QA |
| Production | CDN-backed static host on custom domain | Live |

**Workflow:** Git feature branches → PR → preview deploy → merge to `main` → auto-deploy to production. Content updates (prices, photos, hours) deploy in minutes with rollback available via host dashboard.

---

## 9. Testing Strategy
- **Manual QA matrix:** Chrome/Safari/Firefox/Edge (latest 2) × (mobile, tablet, desktop).
- **Device tests:** ~360px Android, iPhone (375/390/430), iPad, 1440px desktop.
- **Flow tests:** all four user flows (reserve / order / enquire / browse) end-to-end; message content verified against spec; fallback modal verified with network blocked.
- **Performance:** Lighthouse CI on preview deploys (budgets enforced).
- **Accessibility:** axe DevTools scan + manual keyboard-only walkthrough + screen-reader pass (NVDA/VoiceOver).
- **Cross-checks:** currency formatting, phone regex against real numbers, encoding of special characters in drafted messages.
