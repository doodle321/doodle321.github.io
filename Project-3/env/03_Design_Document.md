# Design Document (UI/UX)
## Roopa Marri Restaurant & Marriage Garden — Website

**Version:** 1.0 | **Date:** September 2026 | **Status:** Draft
**Philosophy:** *"Celebratory warmth — the glow of a wedding night and the comfort of a family dinner, in one design system."*

---

## 1. Brand Foundations

### 1.1 Brand Personality
- **Warm** — hospitality-first, generous spacing, soft radiance
- **Festive but refined** — celebratory gold accents without gaudiness
- **Trustworthy** — real food, real prices, real photos; no stocky clichés
- **Alive** — motion everywhere, but always purposeful (motion = guidance + delight, never noise)

### 1.2 Tone of Voice (copy rules)
- Warm, direct, second person ("Reserve your evening", "Your table is waiting")
- Confident but humble ("Our karahi has been a local favourite since —")
- **Naming rule:** actions are named by outcome — "Checkout", "Confirm Order", "Reserve a Table", "Send Enquiry". The messaging channel (WhatsApp) is named **only** where the brand actually meets the channel: Contact section, floating chat button, footer icon — never inside flow copy.
- No emojis anywhere in UI copy (vector SVG icons carry all visual semantics)

---

## 2. Color System

| Token | Hex | Usage |
|---|---|---|
| `--brand-900` (Deep Maroon) | `#4A1520` | Footer, dark sections, nav text |
| `--brand-700` (Maroon) | `#7A2233` | Primary brand color, headings accents |
| `--brand-500` (Rose) | `#A63A4B` | Secondary accents, hovers |
| `--gold-500` | `#C9A227` | CTAs, highlights, festive touches (garden/wedding sections) |
| `--gold-300` | `#E3C766` | Subtle gold gradients, borders on dark |
| `--cream-50` | `#FAF6EF` | Main background — warm off-white |
| `--cream-100` | `#F3ECDF` | Card backgrounds, alternating sections |
| `--ink-900` | `#241B17` | Body text |
| `--ink-500` | `#6B5F58` | Secondary text, captions |
| `--success` | `#2F7D4F` | Confirmation states |
| `--error` | `#B3261E` | Validation errors |

**Ratios:** cream backgrounds dominate (~70%), maroon structural (~15%), gold celebratory accents (~10%), ink text (~5%). Gold is reserved for *action and celebration* so it always means something.

**Contrast:** all text pairs meet WCAG AA (ink on cream ≥ 12:1; white on maroon ≥ 7:1; ink on gold ≥ 7:1).

---

## 3. Typography

| Role | Font | Weights | Notes |
|---|---|---|---|
| **Display / Headings** | *Playfair Display* (serif) | 600, 700 | Elegant, wedding-invitation feel; used for H1–H2, section titles, prices on menu cards |
| **Body / UI** | *Inter* (sans) | 400, 500, 600 | High legibility at small sizes; all forms, buttons, captions |
| **Accent / Labels** | *Inter* small-caps style (letter-spacing 0.12em, uppercase, 600) | — | Eyebrow labels: "OUR MENU", "THE GARDEN" |

**Scale (1.25 ratio, fluid with clamp):**
- Display XL: clamp(2.75rem → 4.5rem) — hero
- H1: clamp(2rem → 3rem)
- H2: clamp(1.6rem → 2.25rem)
- H3: 1.35rem
- Body: 1rem (16px base), 1.125rem for menu descriptions
- Small/caption: 0.875rem

**Rules:** max line-length 65ch; line-height 1.6 body / 1.15 headings; never set body below 15px on mobile.

---

## 4. Iconography (Vector Only — No Emojis)

- **Library:** Lucide / Heroicons (outline style, 1.5px stroke) as an inline SVG sprite.
- **Size system:** 16 / 20 / 24 / 32px; buttons use 18px icons + label.
- **Icon ↔ meaning map (locked for consistency):**

| Meaning | Icon |
|---|---|
| Reserve a table | calendar-check |
| Book an event | flower-2 / sparkles |
| Order delivery | shopping-bag |
| Add to cart | plus-circle |
| Cart | shopping-cart (with count badge) |
| Confirm / success | check-circle |
| Call | phone |
| WhatsApp channel (contact/footer/fab only) | official WhatsApp glyph SVG |
| Directions | map-pin |
| Hours | clock |
| Menu categories | utensils, flame, drumstick, cup-soda… |
| Dietary tags | leaf (veg), flame (spicy), star (chef's special) |

- Icons always paired with text labels in CTAs (icon-only permitted in icon bars).
- Custom SVG logo: monogram "RM" in a gold-ring badge with a subtle leaf/flourish.

---

## 5. Component Library (Design System)

### 5.1 Core Components

**Buttons**
- `btn-primary` (gold bg, ink text, pill radius 999px, hover: lift -2px + shadow, active: press-scale 0.98)
- `btn-secondary` (maroon outline, transparent bg, hover: fill)
- `btn-ghost` (text + icon, footer/nav)
- States: default / hover / focus-visible (2px gold ring) / disabled / loading (spinner replaces label)

**Cards**
- `menu-card` — cream-100 bg, rounded 16px, dish photo (4:3), name (Playfair 600), description (ink-500), price (gold-500, Playfair), tag chips, Add button appearing on hover (always visible on touch)
- `package-card` — dark maroon gradient, gold border, tier name, capacity, features list, CTA; middle tier elevated ("Most Popular" ribbon)
- `gallery-card` — masonry tile, hover: image scale 1.05 + caption slide-up

**Forms**
- Floating-label inputs; error state: red ring + inline message; valid state: green check icon
- Date/time pickers styled to match; guest stepper with +/- buttons
- Submit button shows inline success morph (button → check → "Request Sent")

**Navigation**
- Desktop: transparent-over-hero → frosted-glass sticky bar on scroll (backdrop-filter blur)
- Mobile: hamburger → full-screen overlay menu with staggered link animation + **bottom action bar** (Call | Reserve | Order) always within thumb reach

**Overlays**
- Cart drawer: right slide-in, 420px, item rows with steppers, totals bar, sticky "Checkout" button
- Lightbox: dark scrim, image + caption, arrows/Esc
- Toast: bottom-center, auto-dismiss 3.5s, success/error variants

**Badges & Chips**
- Menu tags: pill chips (leaf green = veg, flame orange = spicy, star gold = chef's special)
- Cart count: gold circle badge on cart icon

### 5.2 Motion Specs (the "full of life" layer)

| Element | Animation | Duration / Easing |
|---|---|---|
| Hero headline | Words rise-in with 60ms stagger + hero image slow Ken Burns (scale 1 → 1.08 over 12s) | 0.8s cubic-bezier(0.22,1,0.36,1) |
| Section reveals | Fade-up 24px on scroll (GSAP ScrollTrigger, once) | 0.7s ease-out |
| Menu filter | FLIP-style card shuffle | 0.4s spring |
| Counters (stats) | Count-up on enter | 1.2s ease |
| Buttons | Magnetic hover (desktop), press-scale | 150ms |
| Cards | 3D tilt on hover (desktop, ≤6°) | 200ms |
| Cart drawer | Slide-in + backdrop fade; items stagger in | 0.35s ease-out |
| Package cards | Flip on "details" toggle | 0.5s |
| Testimonials | Auto-advance slide | 5s, pause on hover |
| Page load | Logo mark draws itself (SVG stroke-dash), then reveals hero | 1.2s total |
| Scroll indicator | Gentle bounce loop | infinite |

**Global rules:** transform/opacity only (GPU-safe); `prefers-reduced-motion` → all animations collapse to simple fades; nothing auto-plays with sound; motion never delays interactivity > 100ms.
**Reduced-motion × intro interaction (locked rule):** visitors with `prefers-reduced-motion` get the hero rendered instantly — the logo-draw and word-stagger intro is skipped entirely. `rm_seen_intro` is **still set** on their first visit, so they never see a replay affordance later. Non-reduced-motion visitors see the full intro once, per the flag.

---

## 6. Page-by-Page Wireframes (low-fi structure)

> Annotations: [A] = animation zone, [C] = conversion point

### 6.1 Home
```
┌──────────────────────────────────────┐
│ LOGO      Nav links          [Reserve]│  ← transparent → frosted on scroll
│──────────────────────────────────────│
│        HERO (full viewport) [A]      │
│   "Roopa Marri" (Playfair XL)        │
│   Restaurant & Marriage Garden       │
│   [Reserve a Table] [Order Delivery] │ [C]
│   [Book an Event]                    │ [C]
│   scroll indicator ↓                 │
│──────────────────────────────────────│
│ ABOUT: photo left / story right [A]  │
│ stats counters (events, dishes…) [A] │
│──────────────────────────────────────│
│ MENU PREVIEW: category tabs + 8 cards│
│ [View Full Menu →]                   │
│──────────────────────────────────────│
│ THE GARDEN (dark maroon section)     │
│ feature bullets + 3 package cards    │
│ [Explore Packages]            [C]    │
│──────────────────────────────────────│
│ GALLERY strip (horizontal scroll)    │
│──────────────────────────────────────│
│ TESTIMONIALS carousel           [A]  │
│──────────────────────────────────────│
│ HOURS + MAP + CONTACT          [C]   │
│ FOOTER (links, phone, hours, socials)│
└──────────────────────────────────────┘
+ Floating action button (chat icon, bottom-right)
+ Mobile bottom bar: [Call] [Reserve] [Order]
```

### 6.2 Menu Page / Section
```
[Search: "Search dishes…"]  [chips: All|Starters|BBQ|Mains|…]
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ img │ │ img │ │ img │ │ img │   ← 4-col desktop / 2-col tab / 1-col mobile
│Name │ │Name │ │Name │ │Name │
│desc │ │desc │ │desc │ │desc │
│Rs 850 [+]│ │Rs 750 [+]│ ...
└─────┘ └─────┘ └─────┘ └─────┘
Cart FAB (with count) opens drawer →
```

### 6.3 Cart Drawer + Checkout
```
┌────────────── 420px drawer ─────────────┐
│ Your Order                    [close ×] │
│ ┌ img │ Chicken Karahi ×2    Rs 1,700 ┐ │
│ │     │ [−] 2 [+]              [remove]│ │
│ └─────────────────────────────────────┘ │
│ Subtotal                    Rs 4,250    │
│ Delivery                    Rs 150      │
│ ─────────────────────────────────────── │
│ Total                       Rs 4,400    │
│ [ Checkout ]                       [C]  │
└─────────────────────────────────────────┘
Checkout view: Name / Phone / Address / Landmark /
Payment [Cash on Delivery] / Notes → [ Confirm Order ] [C]
→ Success screen: order summary + "Our team will call to confirm."
```

### 6.4 Reservation & Event Booking Forms
```
[section: dark maroon bg, gold accents]
"Reserve Your Evening" / "Plan Your Celebration"
┌ Name ──────────────┐ ┌ Phone ──────────────┐
┌ Date [calendar-picker] ─┐ ┌ Time ───────────────┐
┌ Guests  [−] 4 [+] ──┐
[Occasion (optional) ▾]  [Package (pre-filled, events)]
[Gathering size ▾]  ← events only: 150–250 | 250–350 | 350–500
┌ Special requests ─────────────────────────┐
[ Send Reservation Request ] → morph→ ✓ Sent [C]
Note: "Our team will confirm shortly."
```

### 6.5 Contact
```
Map (lazy iframe) 60% | Info card 40%:
• Address
• Hours + live Open/Closed badge
• [phone icon + 'Call now']  (tap-to-call)
• [WhatsApp glyph] Message us   ← channel named HERE (allowed)
• [Get Directions]
```

---

## 7. User Flows (Seamless Journey Map)

1. **Land → Act in ≤ 2 taps:** every entry page exposes the three CTAs (header / hero / bottom bar). No page is a dead end.
2. **Menu → Cart is continuous:** Add button never navigates away; cart drawer keeps context; back = close drawer, state preserved.
3. **Forms are forgiving:** validation inline, drafts preserved, date/time constraints visible before error.
4. **Handoff is explicit:** after "Confirm Order"/"Send Request", a clear success screen restates the details so the user knows exactly what was forwarded — zero ambiguity, zero "did it work?"
5. **Exit ramps everywhere:** tap-to-call and the contact section reachable from header, footer, bottom bar, and every success screen.

---

## 8. Responsive Breakpoints & Layout

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | ≥360px | Single column, bottom action bar, hamburger nav |
| `md` | ≥768px | 2-col menu, side-by-side about |
| `lg` | ≥1024px | 4-col menu, full nav, garden features split |
| `xl` | ≥1440px | Max content width 1280px centered, larger hero type |

Grid: 12-col, 24px gutters (16px mobile), consistent 64/96px section spacing (48/64 mobile).

---

## 9. Accessibility Checklist
- Semantic landmarks (`header/nav/main/section/footer`), one `h1` per page
- All images alt text; decorative images `alt=""`
- Full keyboard operability incl. drawer, lightbox, menus (focus trap + Esc)
- Visible focus rings (gold 2px offset)
- Color never sole carrier of meaning (tags have icons + text)
- Form labels associated; errors announced via `aria-live`
- Reduced-motion honored; carousels pause on hover/focus
- Touch targets ≥ 44px

---

## 10. Asset & Content Guidelines
- **Photography:** real dishes on cream/dark wood surfaces, garden at golden hour and at night with lights; consistent warm grading. Hero ≥ 2400px wide; menu items 800×600.
- **Logo:** "RM" monogram in gold ring + wordmark "Roopa Marri" Playfair; favicon from monogram.
- **Image pipeline:** hero/gallery brand photography is locally optimized (AVIF + WebP fallbacks, ≤250KB hero, srcset 480/800/1200/1600). **Menu item images are online-hosted absolute URLs** (budget: **≤80KB per menu image** — enforced via `f_auto,q_auto,w_800` CDN transforms) (public image CDN) stored in the menu data file — same source for every visitor, updatable by changing one URL. Every menu `<img>` includes an `onerror` swap to a branded local SVG placeholder so no broken image ever renders.
- **Icon pipeline:** SVG sprite generated at build; tree-shaken (only used icons ship).
