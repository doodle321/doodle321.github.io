
/* =====================================================================
   Roopa Marri — app.js (split-file build; no backend, per ADR-1)
   Modules: config → data → cart → menu → forms → gallery → ui
   ===================================================================== */
"use strict";

/* ---------- config.js (Arch §3.5 — single source of business constants) ---------- */
const CONFIG = {
  businessPhoneIntl: "923462785955",          // wa.me format, no '+'
  businessPhoneDisplay: "+92 346 2785955",
  address: "Main GT Road, Roopa Marri, Punjab, Pakistan",
  openHour: 12, closeHour: 23,                  // daily, drives "Open now" badge
  currency: "Rs",
  deliveryFee: 150,
  freeDeliveryAbove: 3000,
  maxReservationDaysAhead: 180,
  maxEventDaysAhead: 730
};

const IMG = id => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=800&q=60";

