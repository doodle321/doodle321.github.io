# System Architecture Document
## Roopa Marri Restaurant & Marriage Garden — Website
### (Data Models, Integration Contracts & Architecture Overview)

**Version:** 1.0 | **Date:** September 2026 | **Status:** Draft

> **Important framing:** This product is a **100% static frontend**. There is intentionally **no backend, no database, and no API server**. This document therefore covers: (1) the system architecture as it actually exists, (2) the *data models* that live in static data files and browser storage, (3) the **message schemas** that act as the de-facto API contract with the business (the integration that replaces a backend), and (4) deployment & scalability for a serverless static architecture. If a real backend is ever introduced later, the schemas in §3 and §5 are the migration starting point.

---

## 1. System Architecture Overview

### 1.1 High-Level Diagram
```
                        ┌──────────────────────────┐
                        │   VISITOR'S DEVICE        │
                        │  (any modern browser)     │
                        └────────────┬─────────────┘
                                     │ HTTPS (static files only)
              ┌──────────────────────▼───────────────────────┐
              │         STATIC HOST + GLOBAL CDN              │
              │  index.html · css · js modules · data/*.js    │
              │  assets/ (images, SVG sprite, fonts)          │
              │  No compute. No sessions. No DB.              │
              └──────────────────────┬───────────────────────┘
                                     │ (client-side only)
        ┌────────────────────────────┼─────────────────────────────┐
        ▼                            ▼                             ▼
┌───────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ wa.me deep-   │          │ Google Maps      │          │ Privacy-friendly │
│ link handoff  │          │ embed iframe     │          │ analytics        │
│ (integration) │          │ (no key needed)  │          │ (optional)       │
└───────┬───────┘          └──────────────────┘          └──────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ BUSINESS PHONE +92 346       │
│ 2785955 (WhatsApp Business)  │
│ — receives structured        │
│   drafted messages;          │
│   staff confirm by reply     │
└──────────────────────────────┘
```

### 1.2 Architectural Decisions (ADRs)

| # | Decision | Rationale |
|---|---|---|
| ADR-1 | No backend of any kind | All booking/order intent is captured as structured drafted messages to the business number. Owner requirement: zero server cost, zero maintenance, zero data liability. |
| ADR-2 | Vanilla JS + static data files | Scope is small; a framework adds build complexity and payload without benefit. |
| ADR-3 | Client-side cart in `localStorage` | Order persistence across refresh with no server; data never leaves the device except via the drafted message. |
| ADR-4 | `wa.me` deep links over any messaging SDK | Universal, no SDK, no key, no cost; opens the visitor's own WhatsApp with the message pre-filled. |
| ADR-5 | Single `config.js` for business constants | Phone number, hours, fees change in exactly one place, version-controlled. |
| ADR-6 | Message schemas versioned in this doc | The drafted message is the product's only "API" — its format is a contract. |

---

## 2. Deployment Architecture

```
GitHub repo (source of truth)
   │  PR → preview deploy (Netlify/Vercel/CF Pages)
   ▼
Merge to main ──auto──▶ Static build (none needed — files as-is)
                           │
                           ▼
                    Global CDN edge nodes (HTTPS, HSTS, HTTP/2/3)
                           │
                    Custom domain: roopamarri… (DNS CNAME)
```

- **Build step:** none required (or optional lightweight pipeline for minification/image optimization).
- **Environments:** local static server → PR preview URL → production CDN.
- **Rollback:** host dashboard one-click (instant cache purge).
- **Uptime responsibility:** entirely on the CDN (99.9%+ SLA on free tiers).

---

## 3. Data Models (Static Content Files)

These models are the "database" of the system — plain ES modules / JSON under version control.

### 3.1 `MenuItem`
```jsonc
{
  "id": "chk-karahi-half",        // stable slug, used in cart + messages
  "name": "Chicken Karahi (Half)",
  "category": "karahi",           // starters|bbq|mains|karahi|rice|breads|desserts|beverages
  "price": 850,                   // PKR, integer
  "description": "…",
  "image": "https://res.cloudinary.com/<cloud>/menu/chk-karahi.webp",  // absolute online URL — same for every visitor
  "tags": ["spicy", "best-seller"],  // veg|spicy|chefs-special|best-seller
  "available": true               // false hides item without deleting history
}
```

### 3.2 `EventPackage`
```jsonc
{
  "id": "signature",
  "tier": "Signature",            // Essential|Signature|Grand
  "tagline": "Our most-loved wedding setup",
  "guestRange": [200, 500],
  "priceLabel": "On request",     // or "From Rs 450,000"
  "features": ["Decorated stage", "LED lighting", "Catering for 10+ dishes", "Parking for 100+ cars", "Bridal room"],
  "popular": true                 // renders "Most Popular" ribbon
}
```

### 3.3 `GalleryItem`
```jsonc
{
  "src": "assets/gallery/wedding-01.webp",
  "alt": "Night wedding setup in the garden with gold lighting",
  "category": "weddings",         // food|garden|weddings|events
  "caption": "A gold-and-maroon wedding evening"
}
```

### 3.4 `Testimonial`
```jsonc
{ "quote": "…", "name": "Ahmed R.", "occasion": "Walima, 2025" }
```

### 3.5 `SiteConfig` (config.js)
```jsonc
{
  "businessPhoneIntl": "923462785955",   // wa.me format, no '+'
  "businessPhoneDisplay": "+92 346 2785955",
  "address": "…",
  "hours": { "monSun": "12:00–23:00" },  // drives "Open now" badge
  "currency": "Rs",
  "deliveryFee": 150,
  "freeDeliveryAbove": 3000,
  "maxReservationDaysAhead": 180,
  "maxEventDaysAhead": 730,
  "eventGuestOptions": ["150–250", "250–350", "350–500"],  // event enquiry dropdown — the only valid values
}
```

### 3.6 Image Asset Strategy
- **Menu items:** `image` is an absolute `https://` URL (public image CDN — Cloudinary recommended; direct Unsplash/Pexels source URLs acceptable for stock food shots). The repo contains **no binary menu images**; content updates are URL swaps in `data/menu.js`.
- **Hero/gallery/about brand photos:** locally hosted under `assets/img/` (these are unique brand assets worth owning).
- **Resilience contract:** the renderer attaches `onerror` to every remote image → falls back to `assets/img/placeholder-dish.svg`; a missing remote file degrades to a branded placeholder, never a broken image icon.
- **Audit:** README includes a quarterly "check image URLs" checklist.

### 3.7 Client-Side State (browser `localStorage`)

| Model | Key | Shape |
|---|---|---|
| `Cart` | `rm_cart` | `[{ "id": "chk-karahi-half", "qty": 2 }]` — ids reference MenuItem; prices always re-derived from data file at checkout (never trust stored prices) |
| `FormDraft` | `rm_form_draft` | last-entered form fields per flow, for in-session convenience |
| `IntroSeen` | `rm_seen_intro` | boolean — hero intro plays once per browser |

**Relationships (logical):** Cart → MenuItem (many-to-one, by id). EventPackage tiers are aligned to `config.eventGuestOptions` brackets so the selected dropdown value maps cleanly to a package's `guestRange`. Reservation/Order/Enquiry messages → MenuItem/Package (referenced by id and denormalized into message text at build time). Nothing else relates — by design.

---

## 4. Message Schemas (the de-facto API)

The drafted messages sent to the business number are the system's only outbound contract. Format is versioned; the version line lets staff and future automation detect the format.

### 4.1 Schema: `ORDER` (delivery)
```
RM/ORDER/v1
──────────────────────
Name: <customer name>
Phone: <customer phone>
Address: <address>
Landmark: <optional>
Payment: Cash on Delivery

Items:
1. Chicken Karahi (Half) x2 — Rs 1,700
2. …

Subtotal: Rs 4,250
Delivery: Rs 150
Total: Rs 4,400

Notes: <optional>
```
*Build rule: prices computed from `data/menu.js` at confirm time; line format `N. <name> x<qty> — Rs <line total>`; totals on their own lines for easy reading on a phone.*

### 4.2 Schema: `RESERVATION`
```
RM/RESERVE/v1
──────────────────────
Name: …
Phone: …
Date: DD MMM YYYY
Time: HH:MM
Guests: N
Occasion: <optional>
Requests: <optional>
```

### 4.3 Schema: `EVENT_ENQUIRY`
```
RM/EVENT/v1
──────────────────────
Package: Signature
Event type: Wedding / Mehndi / Corporate / Other
Preferred date: …
Gathering size: 150–250 | 250–350 | 350–500
Name: …
Phone: …
Notes: …
```

### 4.4 Handoff Flow (sequence)
```
User submits valid form
   → buildMessage(type, payload)            [app.js]
   → encodeURIComponent(message)            [forms.js]
   → window.open(`https://wa.me/${phone}?text=${enc}`)
   → render local Success screen (same summary)
Fallback (handoff fails): modal with message text + Copy + Call buttons
```

**Naming rule:** UI copy around these flows says "Confirm Order", "Send Reservation Request", "Send Enquiry" — the channel is identified only in the Contact section, footer, and floating action button.

---

## 5. API & Endpoints

There are **no first-party endpoints** — by design (ADR-1). Reference table for clarity:

| Capability | Classic approach | THIS system's approach |
|---|---|---|
| Create reservation | `POST /api/reservations` | Schema 4.2 via `wa.me` handoff |
| Create order | `POST /api/orders` | Schema 4.1 via `wa.me` handoff |
| Create event enquiry | `POST /api/enquiries` | Schema 4.3 via `wa.me` handoff |
| Read menu/packages | `GET /api/menu` | Static `data/menu.js` (bundled) |
| Payment | `POST /api/pay` | Out of scope (cash on delivery) |
| Auth | Sessions/JWT | Not applicable (no accounts) |

**Third-party touchpoints (the only network calls at runtime):** `wa.me` redirect, Google Maps iframe, Google Fonts CDN, optional analytics snippet. No API keys are required for any of them.

---

## 6. Authentication & Security Architecture

| Concern | Classic backend answer | THIS system |
|---|---|---|
| Authentication / sessions | JWT/OAuth | **Not applicable** — no accounts, no server state |
| Authorization | Role checks | **Not applicable** — single public read-only content |
| Input attacks (SQLi, SSRF, file upload) | Server validation | **Eliminated by architecture** — no server, no DB, no uploads |
| XSS | Output encoding | All user input flows only into `encodeURIComponent` message strings or `textContent` nodes — never `innerHTML` |
| CSRF | Tokens | Not applicable (no state-changing endpoints) |
| Data privacy | DB encryption, retention policy | Nothing is stored server-side; visitor data exists only in their own device storage and their own messaging app. Privacy is architectural, not procedural. |
| Transport | HTTPS | Enforced by host (HSTS); also required for reliable `wa.me` handoff |
| Supply chain | Dependency audits | Minimal deps, pinned CDN versions with SRI hashes |
| Abuse / spam to business line | Rate limiting at API | Client-side human pace only — accepted residual risk (mitigation: structured format makes junk obvious; number changeable in one config constant) |

---

## 7. Scalability & Capacity Planning

- **Read traffic:** unbounded for practical purposes — static CDN serves any volume; no sessions or compute per visitor.
- **Write traffic (orders/bookings):** the "write path" is the visitor's own messaging app — the system scales exactly as the business's phone staffing does. Human confirmation is the deliberate bottleneck; no code bottleneck exists.
- **Content growth:** hundreds of menu items / gallery photos change file sizes only; recommend keeping initial payload within the TRD budgets via lazy loading.
- **Geographic:** CDN edge caching gives global latency ≈ local latency.
- **Cost curve:** ~flat at $0–10/month (domain + optional paid hosting tier) regardless of traffic.
- **Failure modes & fallbacks:**

| Failure | Impact | Fallback |
|---|---|---|
| CDN/host outage (rare) | Site unreachable | Status via host; RTO ≈ host recovery; no data lost (stateless) |
| Messaging service down | Handoff fails | Fallback modal: copy message + tap-to-call |
| Visitor has no messaging app | Handoff fails | Same fallback modal |
| `localStorage` cleared/unavailable | Cart lost gracefully | Site fully functional; cart just starts empty |
| Business number changes | Old links stale | Update `config.js` → redeploy in minutes |

---

## 8. Future Backend Migration Path (if ever needed)

The architecture deliberately keeps the door open without paying for it now:

1. Message schemas (§4) become the request DTOs of a future `POST /api/orders|reservations|enquiries`.
2. Static data files (§3) import directly into a real database seed.
3. Cart localStorage key/shape becomes the client sync model.
4. Until then: zero backend cost, zero maintenance, zero breach surface.

---

## 9. Repository Structure (proposed)

```
roopamarri-site/
├── index.html
├── css/  (styles.css)
├── js/
│   ├── config.js
│   ├── data/        (menu.js, packages.js, gallery.js, testimonials.js)
│   ├── modules/     (cart.js, forms.js, menu.js, gallery.js, animations.js, ui.js)
│   └── app.js
├── assets/
│   ├── icons/       (svg sprite)
│   ├── img/         (hero, about, gallery, placeholder-dish.svg fallback)
│   └── menu/        (intentionally empty — menu images are online-hosted URLs)
├── docs/            (this document set)
├── robots.txt · sitemap.xml · manifest.webmanifest
└── README.md        (content-editing cheat sheet for non-developers)
```
