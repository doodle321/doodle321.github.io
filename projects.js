/* ============================================================
   PROJECT REGISTRY — DevByAmmar Portfolio
   ------------------------------------------------------------
   HOW TO ADD A NEW PROJECT:
   1. Create the project folder in this directory:
         project-4/index.html
   2. Copy one of the blocks below, paste it after the last one
      (keep the commas correct), and update the values.
   3. Save this file — the portfolio grid, filter buttons and
      previews update automatically. Nothing else needs change.

   FIELDS
   id          unique slug (used for ARIA / DOM ids)
   title       project name shown on the card
   category    "web" = Web Development · "smm" = Social Media
   file        link opened when the card is clicked (new tab)
   image       screenshot path — reserved for future card layouts
   preview     one-line status shown inside the mockup browser
   description short paragraph under the title
   tags        chips shown on the card
   filters     which filter buttons show this card:
               "restaurant" · "pwa" · "whatsapp"
   badge       small label on the preview (default: "Live demo")
   ============================================================ */

const FILTERS = [
  ["all",        "All"],
  ["restaurant", "Restaurant"],
  ["pwa",        "PWA"],
  ["whatsapp",   "WhatsApp Commerce"],
];

const PROJECTS = [
  {
    id: "sindh-and-spice",
    title: "Sindh & Spice",
    category: "web",
    file: "/project-1/",
    image: "project-1/screenshot.jpg",
    preview: "₨ 1,050 · 4 items in cart",
    description: "Live menu, category filters, multi-step cart, digital receipt and direct WhatsApp ordering.",
    tags: ["HTML", "CSS", "JavaScript", "WhatsApp Commerce"],
    filters: ["restaurant", "whatsapp"]
  },
  {
    id: "lazeez-hyderabad",
    title: "Lazeez Hyderabad",
    category: "web",
    file: "/project-2/",
    image: "project-2/screenshot.jpg",
    preview: "Table for 4 · tonight 8:30 PM",
    description: "Menu search & filtering, order receipts, table reservations, animated sections and a review carousel.",
    tags: ["HTML", "CSS", "JavaScript", "UI Design"],
    filters: ["restaurant", "whatsapp"]
  },
  {
    id: "roopa-marri",
    title: "Roopa Marri Restaurant & Marriage Garden",
    category: "web",
    file: "/project-3/",
    image: "project-3/screenshot.jpg",
    preview: "Installable · offline-ready menu",
    description: "Fast, fully responsive site — PWA installability, SEO-ready structure and WhatsApp deep-links. Vanilla everything.",
    tags: ["HTML", "CSS", "JavaScript", "PWA", "UI Design"],
    filters: ["restaurant", "pwa", "whatsapp"]
  }
];
