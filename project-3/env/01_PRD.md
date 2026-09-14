# Product Requirements Document (PRD)
## Roopa Marri Restaurant & Marriage Garden — Website

**Version:** 1.0 | **Date:** September 2026 | **Status:** Draft for Approval
**Owner:** Project Team | **Product Type:** Static, Interactive Marketing & Ordering Website (Frontend Only)

---

## 1. Executive Summary

Roopa Marri Restaurant & Marriage Garden is a family-run dining venue and event space. This website is its digital storefront: it introduces the brand, showcases the menu and the marriage garden, lets visitors explore the venue visually, and converts interest into action through **table reservations, event bookings, and delivery orders** — all of which are forwarded directly to the business's phone line via pre-drafted messages (WhatsApp deep links). There is **no backend, no database, and no login system**.

### 1.1 The One-Sentence Vision
*"Give every visitor the feeling of walking through our doors — the food, the garden, the celebrations — and let them reserve, book, or order in under a minute, straight from their phone."*

### 1.2 Business Problem
- Customers currently discover the business by word of mouth or drive-by; there is no central place to see the menu, photos, prices, or event packages.
- Bookings and delivery requests arrive through scattered phone calls — easy to miss, hard to track.
- The marriage garden (a high-value revenue stream) has no dedicated showcase for wedding/corporate packages.

### 1.3 Business Goal
Turn the website into the primary lead-capture channel: every reservation, booking enquiry, and delivery order lands as a structured, pre-filled message on the business phone, ready for a one-tap staff reply.

---

## 2. Scope

### 2.1 In Scope
- Brand storytelling (hero, about, values)
- Full menu browsing with categories, prices, and dietary tags
- Photo gallery of dishes, garden, and events
- Table reservation form (date, time, guests, name, phone)
- Marriage garden event booking enquiry (event type, date, guests, package interest)
- Delivery ordering flow (cart → details → confirm order)
- Contact section (map, hours, phone, socials)
- Fully responsive, animated, accessible static site

### 2.2 Out of Scope (V1)
- Online payment processing
- User accounts / order history
- Real-time availability or table maps
- Admin dashboard (any CMS or server)
- Email capture/newsletter backend
- Multi-language support (V1 is single-language; content written to allow future i18n)

---

## 3. Target Users & User Needs

| Persona | Who | Primary Need | Key Flow |
|---|---|---|---|
| **The Diner** | Local families, office workers | See menu & prices, order food delivery | Browse menu → add to cart → confirm order |
| **The Planner** | Couples/families planning weddings, birthdays, corporate events | Evaluate the garden, see packages, enquire | Gallery → packages → booking enquiry |
| **The Walker-In** | Tourists / passers-by | Find location, hours, call | Contact / map |
| **The Regular** | Repeat customers | Quick reorder, reserve a table fast | Reservation form |

### 3.1 User Needs (derived)
1. **Speed** — order or reserve in under a minute on mobile.
2. **Trust** — real photos, real prices, real reviews feel.
3. **Clarity** — what's included in a garden package, what dishes cost, when we're open.
4. **Zero friction** — no sign-ups, no apps, no payment walls.

---

## 4. Feature Definitions & Expected Behaviour

Each feature below includes: what it is, what the user does, and the **exact expected behaviour**.

### F1. Home / Hero
- **What:** Animated full-screen hero with brand name, tagline, and three primary CTAs: *Reserve a Table*, *Book an Event*, *Order Delivery*.
- **Behaviour:** CTAs scroll or route to the relevant section. Hero cycles through 3–5 high-quality images with a slow Ken Burns / crossfade effect. A subtle scroll indicator animates.

### F2. About & Story
- **What:** Brand story, establishment year, team/owner note, stats counters (e.g., "500+ events hosted", "50+ dishes").
- **Behaviour:** Counters animate on scroll into view; the dishes counter is **data-driven** (computed live from the menu data file, so it never drifts from the real menu). Images parallax lightly.

### F3. Menu
- **What:** Categorized menu: Starters, BBQ/Grill, Main Course (Mutton/Beef/Chicken), Handi/Karahi, Rice & Biryani, Breads, Desserts, Beverages. Each item: name, description, price (PKR), an image (loaded from an **online-hosted URL** so every visitor sees identical content), and tags (Spicy, Chef's Special, Vegetarian, Best Seller). If an image link ever fails, a branded placeholder shows instead of a broken image.
- **Behaviour:**
  - Category tabs with smooth animated filtering.
  - Search/filter input to find dishes.
  - Each item card has an **"Add"** button (quantity stepper appears after first add) feeding the delivery cart.
  - Prices formatted consistently (e.g., "Rs 850").
  - Menu data lives in a single JSON/JS data file for easy price updates; images are referenced by URL, so swapping a dish photo is a one-line change.

### F4. Gallery
- **What:** Masonry grid of **photos** (V1 is photo-only — no video, matching §2.1): dishes, garden daytime/nighttime, wedding setups, corporate events.
- **Behaviour:** Lightbox on click with keyboard navigation (Esc, arrows). Lazy loading. Category filter chips (Food / Garden / Weddings / Events).

### F5. Marriage Garden & Event Packages
- **What:** Showcase of the garden (capacity, features: stage, lighting, parking, catering) and package tiers: *Essential*, *Signature*, *Grand* — each with guest capacity range and "what's included" list, price "on request" or from-price. Package tiers are aligned to the guest-count brackets below.
- **Behaviour:** Package cards flip or expand to show details. **"Enquire / Book This Package"** button opens the booking form with the package pre-selected.

### F6. Table Reservation
- **What:** Form: Name, Phone, Date, Time, Guests (stepper), Occasion (optional), Special requests (optional).
- **Behaviour:**
  - Client-side validation (valid phone format, date not in past, time within opening hours).
  - On submit, a **pre-drafted confirmation message** is composed and the visitor's messaging app opens to the business number with the message ready to send.
  - Success state shown with a summary of the request and a note: *"Our team will confirm your reservation shortly."*
  - No data is stored on any server.

### F7. Delivery Ordering
- **What:** Cart-driven flow across the site: Menu (F3) → Cart Drawer → Checkout Details → Confirm Order.
- **Behaviour:**
  - Cart drawer slides in from the side: item, qty stepper, line total, cart total, delivery fee (flat or free-above threshold — configurable).
  - Checkout form: Name, Phone, Delivery Address, Landmark (optional), Payment method (Cash on Delivery / Pay on delivery — no online payment in V1), Order notes.
  - Validation mirrors F6.
  - On **Confirm Order**, a structured order message (items, quantities, prices, totals, address) is drafted and handed to the messaging app.
  - Cart persists in `localStorage` so a refresh doesn't lose the order.
  - Success screen shows order summary + "Our team will call to confirm."

> **Naming rule:** User-facing copy says "Checkout", "Confirm Order", "Place Order" — never naming the underlying channel. The channel is only named in the Contact section and technical docs.

### F8. Reviews / Testimonials
- **What:** Rotating testimonial carousel (curated quotes with names/occasions).
- **Behaviour:** Auto-advance every 5s, pause on hover, manual dots/arrows.

### F9. Contact & Location
- **What:** Embedded map (Google Maps iframe, lazy-loaded), opening hours, phone number with tap-to-call, messaging app button (named and iconed here — this is where the channel is legitimately named), social links.
- **Behaviour:** "Get Directions" opens maps app. Hours show a live "Open now / Closed" badge based on visitor's local time.

### F10. Global Elements
- Sticky header that shrinks on scroll; mobile bottom action bar with three persistent CTAs (Call / Reserve / Order) on small screens.
- Floating action button for quick messaging (named channel icon).
- Footer: quick links, hours, phone, credit line.
- Animations: scroll-reveal (fade/slide), micro-interactions on buttons, smooth anchor scrolling, page-load intro.

---

## 5. User Flows (Happy Paths)

**Flow A — Reserve a Table:** Home → "Reserve a Table" → form → validate → submit → drafted message opens → user sends → confirmation screen.
**Flow B — Order Delivery:** Menu → add items → cart drawer → checkout details → confirm order → drafted order message opens → user sends → order success screen.
**Flow C — Book an Event:** Home/Nav → Marriage Garden → view packages → "Book This Package" → enquiry form (package pre-filled, guest-count dropdown: 150–250 / 250–350 / 350–500) → submit → drafted message → user sends → thank-you screen.
**Flow D — Just Browsing:** Gallery → About → Contact → tap-to-call / get directions.

At every step, a back/escape path exists; forms keep entered data when reopened in-session.

---

## 6. Non-Functional Requirements

- **Performance:** First contentful paint < 2.5s on 4G; images optimized (WebP/AVIF, lazy); total initial payload < 1.5 MB.
- **Responsiveness:** Flawless on 360px → 4K; touch targets ≥ 44px.
- **Accessibility:** WCAG 2.1 AA — semantic HTML, alt text, focus states, reduced-motion respect, contrast ratios.
- **SEO:** Meta tags, Open Graph, structured data (LocalBusiness/Restaurant schema), sitemap, descriptive alt text.
- **Offline resilience:** Core pages render without JS for SEO (pre-rendered HTML where possible).
- **Compatibility:** Last 2 versions of major browsers.

---

## 7. Success Metrics
- Message forwards (reservations + orders + enquiries) per week — primary KPI.
- Menu → cart → confirm conversion rate.
- Gallery engagement (lightbox opens).
- Mobile vs desktop split; bounce rate on hero.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Visitor edits the drafted message | Acceptable — staff verify details on reply; structured format makes tampering obvious |
| Business number changes | Single constant `BUSINESS_PHONE` in one config file |
| Menu prices drift | Menu data file designed for non-technical editing |
| Heavy images slow load | Compression pipeline, lazy load, responsive srcset |

## 9. Future Considerations (Post-V1)
Online payments, order-status page via link, multi-language, analytics dashboard, table availability widget (requires backend — flagged as separate project).
