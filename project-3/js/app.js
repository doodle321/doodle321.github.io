
/* ===================== Utilities ===================== */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let LAST_MESSAGE = "";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = n => CONFIG.currency + " " + n.toLocaleString("en-US");
const fmtDate = d => String(d.getDate()).padStart(2,"0") + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* Resilience contract (Arch §3.5a): any image that fails swaps to the branded placeholder — never a broken icon. */
document.addEventListener("error", e => {
  const t = e.target;
  if (t && t.tagName === "IMG" && !t.dataset.fbk && t.src !== window.__rmPlaceholder) {
    t.dataset.fbk = "1"; t.src = window.__rmPlaceholder;
  }
}, true);

let toastTimer;
function toast(msg, type) {
  const el = $("#toast");
  el.className = "toast show " + (type || "success");
  el.innerHTML = '<svg class="icon-18"><use href="#i-' + (type === "error" ? "x" : "check") + '"/></svg>' + esc(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

/* ===================== Cart (Arch §3.6 / §4.1 cart.js) ===================== */
const Cart = {
  items: [],   // [{id, qty}] — prices always re-derived from MENU at checkout
  load() { try { this.items = JSON.parse(localStorage.getItem("rm_cart")) || []; } catch (e) { this.items = []; } },
  save() { try { localStorage.setItem("rm_cart", JSON.stringify(this.items)); } catch (e) {} },
  add(id) { const it = this.get(id); it ? it.qty++ : this.items.push({ id, qty: 1 }); this.save(); syncCartUI(); },
  setQty(id, qty) {
    const it = this.get(id);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    this.save(); syncCartUI();
  },
  get(id) { return this.items.find(i => i.id === id); },
  count() { return this.items.reduce((n, i) => n + i.qty, 0); },
  subtotal() { return this.items.reduce((n, i) => { const m = MENU.find(x => x.id === i.id); return n + (m ? m.price * i.qty : 0); }, 0); },
  delivery() { const s = this.subtotal(); return s === 0 || s >= CONFIG.freeDeliveryAbove ? 0 : CONFIG.deliveryFee; },
  total() { return this.subtotal() + this.delivery(); },
  clear() { this.items = []; this.save(); syncCartUI(); }
};

function renderCart() {
  const body = $("#cartBody"), foot = $("#cartFoot");
  const pill = $("#cartCountPill"); pill.textContent = Cart.count();
  if (Cart.count() === 0) {
    body.innerHTML = '<div class="cart-empty"><svg class="icon"><use href="#i-shopping-cart"/></svg><p style="font-weight:600;color:var(--ink-900);margin-bottom:4px">Your order is empty</p><p style="font-size:.88rem">Browse the menu and add something delicious.</p></div>';
    foot.style.display = "none"; return;
  }
  foot.style.display = "";
  body.innerHTML = Cart.items.map(i => {
    const m = MENU.find(x => x.id === i.id); if (!m) return "";
    return '<div class="cart-item">'
      + '<img src="' + m.image + '" alt="" loading="lazy">'
      + '<div class="cart-item-info"><h4>' + esc(m.name) + '</h4><span class="unit">' + fmt(m.price) + ' each</span>'
      + '<div class="cart-item-row">'
      + '<span class="qty-stepper show"><button data-dec="' + m.id + '" aria-label="Decrease quantity"><svg class="icon-16"><use href="#i-minus"/></svg></button><span class="qty">' + i.qty + '</span><button data-inc="' + m.id + '" aria-label="Increase quantity"><svg class="icon-16"><use href="#i-plus"/></svg></button></span>'
      + '<span class="line-total">' + fmt(m.price * i.qty) + '</span></div></div>'
      + '<button class="cart-remove" data-del="' + m.id + '" aria-label="Remove ' + esc(m.name) + '"><svg class="icon-18"><use href="#i-trash"/></svg></button></div>';
  }).join("");
  const d = Cart.delivery();
  $("#cartSubtotal").textContent = fmt(Cart.subtotal());
  $("#cartDelivery").innerHTML = d === 0 ? '<span class="free-delivery">Free</span>' : fmt(d);
  $("#cartTotal").textContent = fmt(Cart.total());
  $("#checkoutTotal").textContent = fmt(Cart.total());
}

function syncCartUI() {
  renderCart();
  $$(".nav-cart .badge, .cart-fab .badge").forEach(b => {
    b.textContent = Cart.count(); b.style.display = Cart.count() ? "grid" : "none";
  });
  const fab = $("#cartFab"); if (fab) fab.classList.toggle("show", Cart.count() > 0);
  /* keep menu-card steppers in sync */
  $$("#menuGrid .menu-card").forEach(card => {
    const id = card.dataset.id; const it = Cart.get(id);
    const addBtn = $(".add-btn", card), stepper = $(".qty-stepper", card);
    if (it) { addBtn.style.display = "none"; stepper.classList.add("show"); $(".qty", stepper).textContent = it.qty; }
    else { addBtn.style.display = ""; stepper.classList.remove("show"); }
  });
}

/* ===================== Menu rendering (§4.1 menu.js) ===================== */
const TAG_META = {
  "veg":          { label: "Veg",          icon: "i-leaf",   cls: "tag-veg" },
  "spicy":        { label: "Spicy",        icon: "i-flame",  cls: "tag-spicy" },
  "chefs-special":{ label: "Chef's Special", icon: "i-star", cls: "tag-special" },
  "best-seller":  { label: "Best Seller",  icon: "i-star",   cls: "tag-bestseller" }
};
let activeCategory = "all", searchTerm = "";

function tagChips(tags) {
  return tags.map(t => {
    const m = TAG_META[t]; if (!m) return "";
    return '<span class="tag ' + m.cls + '"><svg class="icon-16"><use href="#' + m.icon + '"/></svg>' + m.label + '</span>';
  }).join("");
}

function renderChips() {
  const wrap = $("#categoryChips");
  const chips = [{ id: "all", label: "All" }].concat(CATEGORIES);
  wrap.innerHTML = chips.map(c =>
    '<button class="chip' + (c.id === activeCategory ? " active" : "") + '" data-cat="' + c.id + '" role="tab" aria-selected="' + (c.id === activeCategory) + '">' + c.label + '</button>'
  ).join("");
}

function renderMenu() {
  const grid = $("#menuGrid");
  const q = searchTerm.trim().toLowerCase();
  const items = MENU.filter(m => m.available)
    .filter(m => activeCategory === "all" || m.category === activeCategory)
    .filter(m => !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  if (!items.length) {
    grid.innerHTML = '<div class="menu-empty">No dishes match your search — try another word or category.</div>';
    return;
  }
  grid.innerHTML = items.map(m => {
    const inCart = Cart.get(m.id);
    return '<article class="menu-card" data-id="' + m.id + '">'
      + '<div class="menu-card-img"><img src="' + m.image + '" alt="' + esc(m.name) + '" loading="lazy"></div>'
      + '<div class="menu-card-body">'
      + '<div class="menu-card-title"><h3>' + esc(m.name) + '</h3><span class="menu-price">' + fmt(m.price) + '</span></div>'
      + '<p class="menu-card-desc">' + esc(m.description) + '</p>'
      + (m.tags.length ? '<div class="tag-row">' + tagChips(m.tags) + '</div>' : '')
      + '<button class="add-btn" data-add="' + m.id + '"><svg class="icon-18"><use href="#i-plus"/></svg>Add to Order</button>'
      + '<span class="qty-stepper' + (inCart ? " show" : "") + '"><button data-dec="' + m.id + '" aria-label="Decrease quantity"><svg class="icon-16"><use href="#i-minus"/></svg></button><span class="qty">' + (inCart ? inCart.qty : 1) + '</span><button data-inc="' + m.id + '" aria-label="Increase quantity"><svg class="icon-16"><use href="#i-plus"/></svg></button></span>'
      + '</div></article>';
  }).join("");
}

/* ===================== Packages ===================== */
function renderPackages() {
  $("#packageGrid").innerHTML = PACKAGES.map((p, i) =>
    '<div class="package-card reveal' + (p.popular ? " popular" : "") + '" data-delay="' + (i + 1) + '">'
    + (p.popular ? '<span class="popular-ribbon">Most Popular</span>' : '')
    + '<div class="package-tier">' + p.tier + '</div>'
    + '<p class="package-tagline">' + p.tagline + '</p>'
    + '<div class="package-cap"><svg class="icon-18"><use href="#i-users"/></svg>' + p.guestRange[0] + " – " + p.guestRange[1] + ' guests</div>'
    + '<ul class="package-list">' + p.features.map(f => '<li><svg class="icon-16"><use href="#i-check"/></svg>' + f + '</li>').join("") + '</ul>'
    + '<div class="package-price">' + p.priceLabel + '<small>Menu &amp; décor priced per event</small></div>'
    + '<button class="btn btn-primary" data-book="' + p.tier + '"><svg class="icon-18"><use href="#i-sparkles"/></svg>Book This Package</button></div>'
  ).join("");
}

/* ===================== Gallery + lightbox ===================== */
let galleryFilter = "all", lbList = [], lbIndex = 0;
function renderGallery() {
  const list = GALLERY.filter(g => galleryFilter === "all" || g.category === galleryFilter);
  $("#galleryGrid").innerHTML = list.map((g, i) =>
    '<figure class="gallery-item reveal" data-lb="' + i + '" tabindex="0" role="button" aria-label="Open photo: ' + esc(g.caption) + '">'
    + '<img src="' + g.src + '" alt="' + esc(g.alt) + '" loading="lazy">'
    + '<figcaption>' + esc(g.caption) + '</figcaption></figure>'
  ).join("");
  lbList = list;
  observeReveals();
}
function renderGalleryChips() {
  const cats = [{ id: "all", label: "All" }, { id: "food", label: "Food" }, { id: "garden", label: "Garden" }, { id: "weddings", label: "Weddings" }, { id: "events", label: "Events" }];
  $("#galleryChips").innerHTML = cats.map(c =>
    '<button class="chip' + (c.id === galleryFilter ? " active" : "") + '" data-gcat="' + c.id + '">' + c.label + '</button>').join("");
}
function openLightbox(i) {
  lbIndex = i; updateLightbox();
  $("#lightbox").classList.add("open");
  $("#lbClose").focus();
  document.body.style.overflow = "hidden";
}
function updateLightbox() {
  const g = lbList[lbIndex]; if (!g) return;
  const img = $("#lbImg"); img.dataset.fbk = ""; img.src = g.src; img.alt = g.alt;
  $("#lbCaption").textContent = g.caption;
}
function closeLightbox() { $("#lightbox").classList.remove("open"); document.body.style.overflow = ""; }

/* ===================== Testimonials ===================== */
let testiIndex = 0, testiTimer;
function renderTestimonials() {
  $("#testiCarousel").innerHTML = TESTIMONIALS.map((t, i) =>
    '<blockquote class="testi-slide' + (i === 0 ? " active" : "") + '">'
    + '<span class="testi-quote-mark" aria-hidden="true">&ldquo;</span>'
    + '<p class="testi-text">' + esc(t.quote) + '</p>'
    + '<footer class="testi-meta"><strong>' + esc(t.name) + '</strong> · ' + esc(t.occasion) + '</footer></blockquote>'
  ).join("");
  $("#testiDots").innerHTML = TESTIMONIALS.map((_, i) =>
    '<button data-dot="' + i + '" class="' + (i === 0 ? "active" : "") + '" aria-label="Show testimonial ' + (i + 1) + '"></button>').join("");
  if (!REDUCED) startTestiAuto();
}
function showTesti(i) {
  testiIndex = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
  $$(".testi-slide").forEach((s, k) => s.classList.toggle("active", k === testiIndex));
  $$("#testiDots button").forEach((d, k) => d.classList.toggle("active", k === testiIndex));
}
function startTestiAuto() {
  clearInterval(testiTimer);
  testiTimer = setInterval(() => showTesti(testiIndex + 1), 5000);
}

/* ===================== Message schemas + handoff (Arch §4 — the de-facto API) ===================== */
const SEP = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";

function buildOrderMessage(d) {
  const lines = Cart.items.map((i, n) => {
    const m = MENU.find(x => x.id === i.id);
    return (n + 1) + ". " + m.name + " x" + i.qty + " \u2014 " + fmt(m.price * i.qty);
  });
  const dFee = Cart.delivery();
  return ["RM/ORDER/v1", SEP,
    "Name: " + d.name, "Phone: " + d.phone, "Address: " + d.address,
    "Landmark: " + (d.landmark || "\u2014"), "Payment: Cash on Delivery", "",
    "Items:", lines.join("\n"), "",
    "Subtotal: " + fmt(Cart.subtotal()),
    "Delivery: " + (dFee === 0 ? "FREE" : fmt(dFee)),
    "Total: " + fmt(Cart.total()), "",
    "Notes: " + (d.notes || "\u2014")
  ].join("\n");
}
function buildReservationMessage(d) {
  return ["RM/RESERVE/v1", SEP,
    "Name: " + d.name, "Phone: " + d.phone,
    "Date: " + d.date, "Time: " + d.time, "Guests: " + d.guests,
    "Occasion: " + (d.occasion || "\u2014"), "Requests: " + (d.requests || "\u2014")
  ].join("\n");
}
function buildEventMessage(d) {
  return ["RM/EVENT/v1", SEP,
    "Package: " + d.pkg, "Event type: " + d.type,
    "Preferred date: " + d.date, "Expected guests: " + d.guests,
    "Name: " + d.name, "Phone: " + d.phone,
    "Notes: " + (d.notes || "\u2014")
  ].join("\n");
}

/* Arch §4.4 handoff sequence */
function handoff(message) {
  LAST_MESSAGE = message;
  const url = "https://wa.me/" + CONFIG.businessPhoneIntl + "?text=" + encodeURIComponent(message);
  let win = null;
  try { win = window.open(url, "_blank"); } catch (e) { win = null; }  /* WhatsApp only: new tab */
  if (!win) showFallback(message);   /* popup blocked → modal with Copy + Call (Arch §7) */
}
function showFallback(message) {
  $("#fallbackText").value = message;
  $("#fallbackModal").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeFallback() { $("#fallbackModal").classList.remove("open"); document.body.style.overflow = ""; }

/* ===================== Validation helpers (TRD §5.2) ===================== */
const PHONE_RE = /^(\+?92|0)?[\s-]?3\d{2}[\s-]?\d{7}$/;
function setField(fieldEl, ok, msg) {
  fieldEl.classList.toggle("error", !ok);
  fieldEl.classList.toggle("valid", ok);
  if (msg) $(".field-msg", fieldEl).textContent = msg;
  return ok;
}
function validDateStr(v, maxDays) {
  if (!v) return false;
  const d = new Date(v + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const max = new Date(today); max.setDate(max.getDate() + maxDays);
  return d >= today && d <= max;
}
function wireValidation(input, fn) {
  input.addEventListener("input", () => {
    const f = input.closest(".field");
    if (f && f.classList.contains("error")) setField(f, fn(input.value));
  });
  input.addEventListener("blur", () => {
    if (input.value) setField(input.closest(".field"), fn(input.value));
  });
}
function morphButton(btn) {
  btn.classList.add("loading");
  return new Promise(res => setTimeout(() => { btn.classList.remove("loading"); res(); }, 650));
}
function summaryHTML(rows) {
  return '<dl class="success-summary">' + rows.filter(r => r[1]).map(r =>
    "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>").join("") + "</dl>";
}


/* ===================== Forms (§4.1 forms.js) ===================== */
function setupDateBounds() {
  const today = new Date(), rMax = new Date(), eMax = new Date();
  rMax.setDate(rMax.getDate() + CONFIG.maxReservationDaysAhead);
  eMax.setDate(eMax.getDate() + CONFIG.maxEventDaysAhead);
  const iso = d => d.toISOString().slice(0, 10);
  $("#rDate").min = iso(today); $("#rDate").max = iso(rMax);
  $("#eDate").min = iso(today); $("#eDate").max = iso(eMax);
}

function restoreDrafts() {
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem("rm_form_draft")) || {}; } catch (e) {}
  $$("#panelReserve input, #panelReserve select, #panelReserve textarea, #panelEvent input, #panelEvent select, #panelEvent textarea, #checkoutForm input, #checkoutForm textarea").forEach(el => {
    if (draft[el.id] != null && el.type !== "date") { el.value = draft[el.id]; }
    if (el.tagName === "SELECT" && el.value) el.classList.add("filled");
  });
  if ($("#rGuests").value) $("#rGuestsVal").textContent = $("#rGuests").value;
}
function saveDraft(el) {
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem("rm_form_draft")) || {}; } catch (e) {}
  draft[el.id] = el.value;
  try { localStorage.setItem("rm_form_draft", JSON.stringify(draft)); } catch (e) {}
}

function initReservationForm() {
  const form = $("#panelReserve");
  const name = $("#rName"), phone = $("#rPhone"), date = $("#rDate"), time = $("#rTime"),
        guests = $("#rGuests"), occasion = $("#rOccasion"), requests = $("#rRequests");
  wireValidation(name, v => v.trim().length >= 2);
  wireValidation(phone, v => PHONE_RE.test(v.trim()));
  wireValidation(date, v => validDateStr(v, CONFIG.maxReservationDaysAhead));
  wireValidation(time, v => v >= "12:00" && v <= "23:00");
  $$(".qty-stepper-mini", form).forEach(btn => btn.addEventListener("click", () => {
    let g = parseInt(guests.value, 10) || 4;
    g = Math.min(500, Math.max(1, g + parseInt(btn.dataset.step, 10)));
    guests.value = g; $("#rGuestsVal").textContent = g;
  }));
  form.addEventListener("submit", async e => {
    e.preventDefault();
    let ok = true;
    ok = setField(name.closest(".field"), name.value.trim().length >= 2) && ok;
    ok = setField(phone.closest(".field"), PHONE_RE.test(phone.value.trim())) && ok;
    ok = setField(date.closest(".field"), validDateStr(date.value, CONFIG.maxReservationDaysAhead)) && ok;
    ok = setField(time.closest(".field"), time.value >= "12:00" && time.value <= "23:00", "We serve daily 12:00 – 23:00.") && ok;
    if (!ok) { toast("Please fix the highlighted fields.", "error"); return; }
    const d = {
      name: name.value.trim(), phone: phone.value.trim(),
      date: fmtDate(new Date(date.value + "T00:00:00")), time: time.value,
      guests: guests.value, occasion: occasion.value, requests: requests.value.trim()
    };
    await morphButton($(".submit-btn", form));
    handoff(buildReservationMessage(d));
    showFormSuccess("Reservation Sent", [
      ["Name", d.name], ["Phone", d.phone], ["Date", d.date], ["Time", d.time],
      ["Guests", d.guests], ["Occasion", d.occasion]
    ], "Our team will confirm your reservation shortly. The summary is ready in your messaging app — press send there to deliver it.");
  });
}

function initEventForm() {
  const form = $("#panelEvent");
  const pkg = $("#ePackage"), type = $("#eType"), date = $("#eDate"), guests = $("#eGuests"),
        name = $("#eName"), phone = $("#ePhone"), notes = $("#eNotes");
  wireValidation(name, v => v.trim().length >= 2);
  wireValidation(phone, v => PHONE_RE.test(v.trim()));
  wireValidation(date, v => validDateStr(v, CONFIG.maxEventDaysAhead));
  wireValidation(guests, v => v >= 50 && v <= 2000);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    let ok = true;
    ok = setField(pkg.closest(".field"), !!pkg.value) && ok;
    ok = setField(type.closest(".field"), !!type.value) && ok;
    ok = setField(date.closest(".field"), validDateStr(date.value, CONFIG.maxEventDaysAhead)) && ok;
    ok = setField(guests.closest(".field"), guests.value >= 50 && guests.value <= 2000) && ok;
    ok = setField(name.closest(".field"), name.value.trim().length >= 2) && ok;
    ok = setField(phone.closest(".field"), PHONE_RE.test(phone.value.trim())) && ok;
    if (!ok) { toast("Please fix the highlighted fields.", "error"); return; }
    const d = {
      pkg: pkg.value, type: type.value,
      date: fmtDate(new Date(date.value + "T00:00:00")),
      guests: guests.value, name: name.value.trim(), phone: phone.value.trim(), notes: notes.value.trim()
    };
    await morphButton($(".submit-btn", form));
    handoff(buildEventMessage(d));
    showFormSuccess("Enquiry Sent", [
      ["Package", d.pkg], ["Event type", d.type], ["Preferred date", d.date],
      ["Expected guests", d.guests], ["Name", d.name], ["Phone", d.phone]
    ], "Our events team will reply with package details and a walkthrough slot. The summary is ready in your messaging app — press send there to deliver it.");
  });
}

function showFormSuccess(title, rows, note) {
  const box = $("#formSuccess");
  box.innerHTML = '<div class="success-icon"><svg class="icon" style="width:34px;height:34px"><use href="#i-check"/></svg></div>'
    + "<h3>" + title + "</h3><p>" + note + "</p>" + summaryHTML(rows)
    + '<button class="btn btn-dark-ghost" id="msgOptionsBtn" style="font-size:.85rem;min-height:42px"><svg class="icon-16"><use href="#i-info"/></svg>Message didn\'t open? Copy &amp; call options</button>'
    + '<button class="btn btn-secondary" id="anotherRequest">Send Another Request</button>';
  $("#panelReserve").style.display = "none";
  $("#panelEvent").style.display = "none";
  $(".form-tabs").style.display = "none";
  box.style.display = "block";
  box.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
  $("#anotherRequest").addEventListener("click", () => {
    box.style.display = "none";
    $(".form-tabs").style.display = "";
    switchTab($("#tabEvent").getAttribute("aria-selected") === "true" ? "event" : "reserve");
  });
  $("#msgOptionsBtn").addEventListener("click", () => showFallback(LAST_MESSAGE));
}

function switchTab(which) {
  const isReserve = which === "reserve";
  $("#tabReserve").classList.toggle("active", isReserve);
  $("#tabReserve").setAttribute("aria-selected", isReserve);
  $("#tabEvent").classList.toggle("active", !isReserve);
  $("#tabEvent").setAttribute("aria-selected", !isReserve);
  $("#panelReserve").style.display = isReserve ? "" : "none";
  $("#panelEvent").style.display = isReserve ? "none" : "";
  $("#formSuccess").style.display = "none";
  $(".form-tabs").style.display = "";
}

function initCheckoutForm() {
  const form = $("#checkoutForm");
  const name = $("#cName"), phone = $("#cPhone"), address = $("#cAddress"), landmark = $("#cLandmark"), notes = $("#cNotes");
  wireValidation(name, v => v.trim().length >= 2);
  wireValidation(phone, v => PHONE_RE.test(v.trim()));
  wireValidation(address, v => v.trim().length >= 6);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (Cart.count() === 0) return;
    let ok = true;
    ok = setField(name.closest(".field"), name.value.trim().length >= 2) && ok;
    ok = setField(phone.closest(".field"), PHONE_RE.test(phone.value.trim())) && ok;
    ok = setField(address.closest(".field"), address.value.trim().length >= 6) && ok;
    if (!ok) { toast("Please fix the highlighted fields.", "error"); return; }
    const d = {
      name: name.value.trim(), phone: phone.value.trim(), address: address.value.trim(),
      landmark: landmark.value.trim(), notes: notes.value.trim()
    };
    const msg = buildOrderMessage(d);
    await morphButton($("#confirmOrderBtn"));
    handoff(msg);
    /* Success screen with the same summary — zero ambiguity (PRD §7, rule 4) */
    $("#orderSuccessSummary").innerHTML = summaryHTML([
      ["Items", Cart.count() + " item" + (Cart.count() > 1 ? "s" : "")],
      ["Total", fmt(Cart.total())],
      ["Deliver to", d.address],
      ["Payment", "Cash on Delivery"]
    ]).replace(/^<dl class="success-summary">|<\/dl>$/g, "");
    $("#orderSuccessSummary").innerHTML = summaryHTML([
      ["Items", Cart.count() + " item" + (Cart.count() > 1 ? "s" : "")],
      ["Total", fmt(Cart.total())],
      ["Deliver to", d.address],
      ["Payment", "Cash on Delivery"]
    ]);
    showDrawerView("successView");
    Cart.clear();
  });
}

/* ===================== Cart drawer ===================== */
let lastFocused = null;
function showDrawerView(id) {
  $$(".drawer-view").forEach(v => v.classList.remove("active"));
  $("#" + id).classList.add("active");
}
function openCart() {
  lastFocused = document.activeElement;
  renderCart();
  showDrawerView("cartView");
  $("#cartDrawer").classList.add("open");
  $("#scrim").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#cartClose").focus();
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#scrim").classList.remove("open");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

/* ===================== WhatsApp channel links (named ONLY in contact/footer/fab, per naming rule) ===================== */
function initChannelLinks() {
  const greet = encodeURIComponent("Hello Roopa Marri! I have a question.");
  ["contactWaBtn", "footerWaBtn", "fabWa"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.href = "https://wa.me/" + CONFIG.businessPhoneIntl + "?text=" + greet; el.target = "_blank"; el.rel = "noopener"; }
  });
}

/* ===================== UI chrome ===================== */
function initHeader() {
  const header = $("#siteHeader");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  /* cart button in desktop nav */
  const navCart = document.createElement("button");
  navCart.className = "nav-cart";
  navCart.setAttribute("aria-label", "Open your order");
  navCart.innerHTML = '<svg class="icon"><use href="#i-shopping-cart"/></svg><span class="badge" style="display:none">0</span>';
  navCart.addEventListener("click", openCart);
  $(".main-nav").insertBefore(navCart, $(".nav-cta"));
  /* floating cart button once items exist */
  const fab = document.createElement("button");
  fab.className = "cart-fab"; fab.id = "cartFab";
  fab.setAttribute("aria-label", "Open your order");
  fab.innerHTML = '<svg class="icon"><use href="#i-shopping-cart"/></svg><span class="badge" style="display:none">0</span>';
  fab.addEventListener("click", openCart);
  document.body.appendChild(fab);
}
function initMobileNav() {
  const nav = $("#mobileNav"), btn = $("#hamburger");
  const open = () => { nav.classList.add("open"); btn.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; };
  const close = () => { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
  btn.addEventListener("click", open);
  $("#mobileNavClose").addEventListener("click", close);
  $$("#mobileNav a").forEach(a => a.addEventListener("click", close));
  window.__closeMobileNav = close;
}
function initHero() {
  /* Headline word rise-in with 60ms stagger (Design §5.2) */
  const h1 = $("#heroTitle");
  const words = h1.textContent.trim().split(/\s+/);
  h1.innerHTML = words.map((w, i) =>
    '<span class="word"><span style="animation-delay:' + (0.15 + i * 0.06) + 's">' + esc(w) + "</span></span>").join(" ");
  const seen = (() => { try { return localStorage.getItem("rm_seen_intro"); } catch (e) { return "1"; } })();
  const parts = ["#heroEyebrow", "#heroTagline", "#heroCtas", "#heroMeta"];
  if (seen || REDUCED) {
    parts.forEach(s => { const el = $(s); el.style.transition = "none"; el.style.opacity = "1"; });
    h1.querySelectorAll(".word span").forEach(s => { s.style.animation = "none"; s.style.transform = "none"; });
  } else {
    parts.forEach(s => $(s).style.opacity = "1");
    try { localStorage.setItem("rm_seen_intro", "1"); } catch (e) {}
  }
  /* Ken Burns crossfade across 3–5 images (PRD F1) */
  const slides = $$(".hero-slide");
  if (!REDUCED && slides.length > 1) {
    let cur = 0;
    setInterval(() => {
      slides[cur].classList.remove("active");
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add("active");
    }, 7000);
  }
}
let revealObserver;
function observeReveals() {
  if (!revealObserver) return;
  $$(".reveal:not(.in)").forEach(el => revealObserver.observe(el));
}
function initReveals() {
  if (REDUCED) { $$(".reveal").forEach(el => el.classList.add("in")); return; }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); } });
  }, { threshold: 0.12 });
  observeReveals();
}
function initCounters() {
  const els = $$("[data-count]");
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const target = parseInt(en.target.dataset.count, 10);
      if (REDUCED) { en.target.textContent = target; return; }
      const t0 = performance.now(), dur = 1200;
      (function tick(t) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        en.target.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
}
function initOpenBadge() {
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  const open = h >= CONFIG.openHour && h < CONFIG.closeHour;
  const badge = $("#openBadge");
  badge.classList.add(open ? "open" : "closed");
  $("#openBadgeText").textContent = open
    ? "Open now · until 11:00 PM"
    : "Closed now · opens at 12:00 PM";
}

/* ===================== Global event wiring ===================== */
function initEvents() {
  /* Menu: category chips, search, add-to-cart (event delegation) */
  $("#categoryChips").addEventListener("click", e => {
    const chip = e.target.closest("[data-cat]"); if (!chip) return;
    activeCategory = chip.dataset.cat; renderChips(); renderMenu();
  });
  let searchDeb;
  $("#menuSearch").addEventListener("input", e => {
    clearTimeout(searchDeb);
    searchDeb = setTimeout(() => { searchTerm = e.target.value; renderMenu(); }, 160);
  });
  /* Gallery chips */
  $("#galleryChips").addEventListener("click", e => {
    const chip = e.target.closest("[data-gcat]"); if (!chip) return;
    galleryFilter = chip.dataset.gcat; renderGalleryChips(); renderGallery();
  });
  /* Delegated clicks: add/inc/dec, package booking, lightbox, testi dots */
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const del = e.target.closest("[data-del]");
    const book = e.target.closest("[data-book]");
    const lb = e.target.closest("[data-lb]");
    const dot = e.target.closest("[data-dot]");
    if (add) { Cart.add(add.dataset.add); const n = MENU.find(m => m.id === add.dataset.add).name; toast(n + " added to your order"); }
    if (inc) Cart.setQty(inc.dataset.inc, Cart.get(inc.dataset.inc).qty + 1);
    if (dec) Cart.setQty(dec.dataset.dec, Cart.get(dec.dataset.dec).qty - 1);
    if (del) Cart.setQty(del.dataset.del, 0);
    if (book) {
      switchTab("event");
      const sel = $("#ePackage"); sel.value = book.dataset.book; sel.classList.add("filled");
      $("#reserve").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      toast("Package pre-selected — complete your enquiry below.");
    }
    if (lb) openLightbox(parseInt(lb.dataset.lb, 10));
    if (dot) { showTesti(parseInt(dot.dataset.dot, 10)); if (!REDUCED) startTestiAuto(); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeCart(); closeLightbox(); closeFallback(); if (window.__closeMobileNav) window.__closeMobileNav();
    }
    if ($("#lightbox").classList.contains("open")) {
      if (e.key === "ArrowRight") { lbIndex = (lbIndex + 1) % lbList.length; updateLightbox(); }
      if (e.key === "ArrowLeft") { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; updateLightbox(); }
    }
  });
  $("#galleryGrid").addEventListener("keydown", e => {
    const item = e.target.closest("[data-lb]");
    if (item && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLightbox(parseInt(item.dataset.lb, 10)); }
  });
  /* Lightbox buttons */
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; updateLightbox(); });
  $("#lbNext").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbList.length; updateLightbox(); });
  $("#lightbox").addEventListener("click", e => { if (e.target === $("#lightbox")) closeLightbox(); });
  /* Cart drawer */
  $("#cartClose").addEventListener("click", closeCart);
  $("#scrim").addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", () => { if (Cart.count() > 0) showDrawerView("checkoutView"); });
  $("#checkoutBack").addEventListener("click", () => showDrawerView("cartView"));
  $("#successDoneBtn").addEventListener("click", closeCart);
  $("#orderMsgOptions").addEventListener("click", () => showFallback(LAST_MESSAGE));
  /* Tabs */
  $("#tabReserve").addEventListener("click", () => switchTab("reserve"));
  $("#tabEvent").addEventListener("click", () => switchTab("event"));
  /* Selects: keep label floated once a value is chosen */
  document.addEventListener("change", e => {
    const el = e.target;
    if (el.matches && el.matches("select")) el.classList.toggle("filled", !!el.value);
    if (["panelReserve", "panelEvent", "checkoutForm"].some(id => document.getElementById(id) && document.getElementById(id).contains(el))) saveDraft(el);
  });
  /* Testimonials: pause auto-advance on hover/focus (PRD F8) */
  const car = $("#testiCarousel");
  car.addEventListener("mouseenter", () => clearInterval(testiTimer));
  car.addEventListener("mouseleave", () => { if (!REDUCED) startTestiAuto(); });
  /* Fallback modal */
  $("#fallbackCopy").addEventListener("click", () => {
    const ta = $("#fallbackText");
    ta.select();
    const done = () => { toast("Message copied — paste it to us on WhatsApp."); closeFallback(); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(done).catch(() => { document.execCommand("copy"); done(); });
    } else { document.execCommand("copy"); done(); }
  });
  $("#fallbackModal").addEventListener("click", e => { if (e.target === $("#fallbackModal")) closeFallback(); });
  /* Mobile bar "Order" opens cart too when items exist */
  $("#mobileBarOrder").addEventListener("click", () => { if (Cart.count() > 0) setTimeout(openCart, 450); });
}


/* Smooth in-page scrolling with header offset (same tab, always) */
function initSmoothScroll() {
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href");
    if (hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (window.__closeMobileNav) window.__closeMobileNav();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: Math.max(0, top), behavior: REDUCED ? "auto" : "smooth" });
    try { history.replaceState(null, "", hash); } catch (err) {}
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

/* ===================== Init ===================== */
document.addEventListener("DOMContentLoaded", () => {
  Cart.load();
  setupDateBounds();
  renderChips(); renderMenu();
  renderPackages();
  renderGalleryChips(); renderGallery();
  renderTestimonials();
  initHeader(); initMobileNav(); initHero();
  initReveals(); initCounters(); initOpenBadge();
  initReservationForm(); initEventForm(); initCheckoutForm();
  initChannelLinks(); initEvents(); initSmoothScroll(); restoreDrafts();
  syncCartUI();
});
