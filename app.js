/* ============ Dev By Ammar — Portfolio logic ============ */
(function(){
  "use strict";

  /* ---------- Nav: scroll state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 40));

  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
  }));

  /* ---------- Active section highlight ---------- */
  const sections = ["home", "about", "services", "work", "contact"];
  const linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
  window.addEventListener("scroll", () => {
    let cur = "home";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 140) cur = id;
    });
    navLinks.querySelectorAll("a").forEach(a => a.classList.remove("active"));
    if (linkMap[cur]) linkMap[cur].classList.add("active");
  });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- Render projects from PROJECTS (projects.js) ---------- */
  const grid = document.getElementById("projectGrid");
  const filterBar = document.getElementById("filterBar");

  const CATEGORY_LABELS = { web: "Web Development", smm: "Social Media Marketing" };

  // Build filter buttons from the categories actually used
  const usedCats = ["all", ...new Set(PROJECTS.map(p => p.category))];
  filterBar.innerHTML = usedCats.map((c, i) =>
    `<button class="filter-btn${i === 0 ? " active" : ""}" data-cat="${c}">${c === "all" ? "All" : CATEGORY_LABELS[c]}</button>`
  ).join("");

  // A filter only earns its place with two or more distinct categories
  if (usedCats.length <= 2) filterBar.style.display = "none";

  function projectCard(p){
    return `
      <article class="project reveal" data-cat="${p.category}">
        <div class="project-preview" data-file="${p.file}" role="link" aria-label="Open ${p.title} live demo" style="cursor:pointer">
          <img src="${p.image}" alt="Screenshot of the ${p.title} website" loading="lazy" onerror="this.parentNode.classList.add('preview-missing');this.remove()">
          <div class="preview-overlay"><span>Open Live Demo</span></div>
        </div>
        <div class="project-body">
          <span class="project-cat">${CATEGORY_LABELS[p.category]}</span>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
          <div class="project-actions">
            <a class="btn btn-accent" href="${p.file}" target="_blank" rel="noopener">Open Live Demo</a>
          </div>
        </div>
      </article>`;
  }

  function renderProjects(cat){
    const list = cat === "all" ? PROJECTS : PROJECTS.filter(p => p.category === cat);
    if (!list.length){
      grid.innerHTML = `<div class="empty-note">New work in this category is on the way.</div>`;
      return;
    }
    grid.innerHTML = list.map(projectCard).join("");
    grid.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }

  filterBar.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.cat);
  });

  renderProjects("all");

  // Clicking a project preview opens the live demo
  grid.addEventListener("click", e => {
    const preview = e.target.closest(".project-preview");
    if (preview) window.open(preview.dataset.file, "_blank");
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();

/* ============================================================
   ENHANCEMENT LAYER — theme toggle, progress, search, FAQ,
   newsletter, cookie banner, modals, UTM, a11y utilities
   ============================================================ */
(function(){
  "use strict";
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = s => s.replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

  const IC = {
    sun:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6a8.5 8.5 0 1 0 10.6 10.6z"/></svg>',
    up:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    eye:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    cookie:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r=".5" fill="currentColor"/><circle cx="14" cy="14.5" r=".5" fill="currentColor"/><circle cx="13" cy="8.5" r=".5" fill="currentColor"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="m8.2 12.4 2.6 2.6 4.9-5.4"/></svg>'
  };

  /* ---------- Dark / light theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  function isDark(){ return root.getAttribute("data-theme") === "dark"; }
  function paintTheme(){
    const dark = isDark();
    if (themeBtn){
      themeBtn.innerHTML = dark ? IC.sun : IC.moon;
      themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      themeBtn.setAttribute("aria-pressed", String(dark));
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0d1117" : "#f4f6f9");
  }
  if (localStorage.getItem("dba-theme") === "dark") root.setAttribute("data-theme", "dark");
  paintTheme();
  if (themeBtn) themeBtn.addEventListener("click", () => {
    if (isDark()) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
    localStorage.setItem("dba-theme", isDark() ? "dark" : "light");
    paintTheme();
  });

  /* ---------- Scroll progress bar + back-to-top (one listener) ---------- */
  const progress = document.createElement("div");
  progress.id = "progressBar";
  document.body.appendChild(progress);
  const toTop = document.createElement("button");
  toTop.id = "toTop";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = IC.up;
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(toTop);
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", h.scrollTop > 500);
  }, { passive: true });

  /* ---------- Floating contact ---------- */
  const floatContact = document.createElement("a");
  floatContact.id = "floatContact";
  floatContact.href = "#contact";
  floatContact.setAttribute("aria-label", "Go to contact section");
  floatContact.innerHTML = IC.chat;
  document.body.appendChild(floatContact);

  /* ---------- Page loader ---------- */
  const loader = document.createElement("div");
  loader.id = "pageLoader";
  loader.innerHTML = '<div class="spinner" role="status" aria-label="Loading site"></div><p>Dev By Ammar</p>';
  document.body.appendChild(loader);
  let loaderHidden = false;
  const hideLoader = () => {
    if (loaderHidden) return; loaderHidden = true;
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 600);
  };
  window.addEventListener("load", () => setTimeout(hideLoader, 450));
  setTimeout(hideLoader, 3500); // failsafe

  /* ---------- Full-site search (index built from the live DOM + PROJECTS) ---------- */
  (function initSearch(){
    const input = $("#searchInput"), box = $("#searchResults");
    if (!input || !box) return;
    const index = [];
    $$("main section[id]").forEach(sec => {
      const h = sec.querySelector(".sec-title");
      if (h) index.push({
        title: h.textContent.trim(),
        url: "#" + sec.id,
        text: sec.innerText.replace(/\s+/g, " ").trim()
      });
    });
    if (Array.isArray(window.PROJECTS)) window.PROJECTS.forEach(p => index.push({
      title: p.title, url: p.file, text: p.description + " " + p.tags.join(" ")
    }));
    let active = -1, current = [];
    const highlight = (txt, q) => esc(txt).replace(
      new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    function render(q){
      const ql = q.toLowerCase();
      current = index
        .filter(it => (it.title + " " + it.text).toLowerCase().includes(ql))
        .slice(0, 8);
      active = -1;
      if (!current.length){
        box.innerHTML = '<div class="sr-empty">No matches — try a different keyword.</div>';
      } else {
        box.innerHTML = current.map((it, i) => {
          const snip = it.text.toLowerCase().indexOf(ql);
          const start = Math.max(0, snip - 30);
          return '<a href="' + esc(it.url) + '" data-i="' + i + '">' +
            '<span class="sr-title">' + highlight(it.title, q) + "</span>" +
            '<span class="sr-snippet">' + highlight(it.text.slice(start, start + 110) + "…", q) + "</span></a>";
        }).join("");
      }
      box.classList.add("open");
    }
    input.addEventListener("input", () => {
      const q = input.value.trim();
      q.length > 1 ? render(q) : box.classList.remove("open");
    });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown"){ e.preventDefault(); active = Math.min(active + 1, current.length - 1); paint(); }
      else if (e.key === "ArrowUp"){ e.preventDefault(); active = Math.max(active - 1, 0); paint(); }
      else if (e.key === "Enter" && active >= 0){ e.preventDefault(); location.hash = current[active].url; box.classList.remove("open"); input.blur(); }
      else if (e.key === "Escape"){ box.classList.remove("open"); input.blur(); }
      function paint(){ $$("a", box).forEach((a, i) => a.classList.toggle("active", i === active)); }
    });
    document.addEventListener("click", e => {
      if (!$("#siteSearch").contains(e.target)) box.classList.remove("open");
    });
  })();

  /* ---------- FAQ accordion (closes siblings) ---------- */
  const faqItems = $$("details.faq-item");
  faqItems.forEach(d => {
    const s = $("summary", d);
    if (s && !$("svg", s)) s.insertAdjacentHTML("beforeend", IC.chev);
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      faqItems.forEach(o => { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Newsletter signup with success date ---------- */
  (function initNewsletter(){
    const form = $("#newsletterForm");
    if (!form) return;
    const email = $("#nlEmail"), err = $("#nlError"),
          success = $("#newsletterSuccess"), dateSlot = $("#newsletterDate"),
          submit = $("#nlSubmit");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const val = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)){
        err.classList.add("show");
        email.setAttribute("aria-invalid", "true");
        email.focus();
        return;
      }
      err.classList.remove("show");
      email.removeAttribute("aria-invalid");
      submit.classList.add("loading");
      setTimeout(() => {
        const date = new Date().toLocaleDateString(undefined,
          { year: "numeric", month: "long", day: "numeric" });
        localStorage.setItem("dba-newsletter", JSON.stringify({ email: val, date }));
        dateSlot.textContent = date;
        success.hidden = false;
        submit.hidden = true;
        email.disabled = true;
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 600);
    });
    email.addEventListener("input", () => err.classList.remove("show"));
  })();

  /* ---------- Password visibility toggle ---------- */
  $$('input[type="password"]').forEach(inp => {
    const wrap = document.createElement("span");
    wrap.className = "pw-wrap";
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-toggle";
    btn.setAttribute("aria-label", "Show password");
    btn.innerHTML = IC.eye;
    btn.addEventListener("click", () => {
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      btn.innerHTML = show ? IC.eyeOff : IC.eye;
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
    wrap.appendChild(btn);
  });

  /* ---------- Cookie banner ---------- */
  (function initCookies(){
    if (localStorage.getItem("dba-cookies")) return;
    const banner = document.createElement("div");
    banner.id = "cookieBanner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<div class="cb-copy">' + IC.cookie +
      "<span>This site uses cookies to improve your experience and analyse traffic.</span></div>" +
      '<button class="btn btn-accent" id="cbAccept">Accept</button>' +
      '<button class="btn btn-ghost" id="cbDecline">Decline</button>';
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add("show"), 900);
    const done = v => {
      localStorage.setItem("dba-cookies", v);
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 450);
    };
    $("#cbAccept", banner).addEventListener("click", () => done("accepted"));
    $("#cbDecline", banner).addEventListener("click", () => done("declined"));
  })();

  /* ---------- Confirmation modal for destructive actions ---------- */
  function confirmDialog(message){
    return new Promise(resolve => {
      const bd = document.createElement("div");
      bd.className = "modal-backdrop";
      bd.innerHTML =
        '<div class="modal-box" role="alertdialog" aria-modal="true" aria-labelledby="dbaModalTitle">' +
        '<h3 id="dbaModalTitle">Please confirm</h3><p>' + esc(message) + "</p>" +
        '<div class="modal-actions">' +
        '<button class="btn btn-ghost" data-act="cancel">Cancel</button>' +
        '<button class="btn btn-danger" data-act="ok">Yes, continue</button>' +
        "</div></div>";
      document.body.appendChild(bd);
      const close = v => { bd.remove(); resolve(v); };
      $('[data-act="cancel"]', bd).addEventListener("click", () => close(false));
      $('[data-act="ok"]', bd).addEventListener("click", () => close(true));
      bd.addEventListener("click", e => { if (e.target === bd) close(false); });
      document.addEventListener("keydown", function onEsc(e){
        if (e.key === "Escape"){ document.removeEventListener("keydown", onEsc); close(false); }
      });
      $('[data-act="cancel"]', bd).focus();
    });
  }
  document.addEventListener("click", async e => {
    const el = e.target.closest('[data-confirm], .btn-danger');
    if (!el || el.dataset.confirmed === "1") return;
    e.preventDefault(); e.stopPropagation();
    if (await confirmDialog(el.dataset.confirm ||
        "This action is destructive and cannot be undone. Continue?")){
      el.dataset.confirmed = "1";
      el.click();
    }
  }, true);
  document.addEventListener("submit", async e => {
    const f = e.target;
    if (!f.matches || !f.matches("form[data-confirm]") || f.dataset.confirmed === "1") return;
    e.preventDefault();
    if (await confirmDialog(f.dataset.confirm ||
        "This action is destructive and cannot be undone. Continue?")){
      f.dataset.confirmed = "1";
      f.submit();
    }
  }, true);

  /* ---------- UTM tracking on outbound links ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="http"]');
    if (!a) return;
    let url;
    try { url = new URL(a.href); } catch { return; }
    if (url.host === location.host) return;
    if (/(^|\.)wa\.me$/.test(url.host) || url.host === "api.whatsapp.com") return; // keep WhatsApp text links clean
    if (!url.searchParams.has("utm_source"))
      url.searchParams.set("utm_source", location.hostname.replace(/^www\./, "") || "portfolio");
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "referral");
    if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", "site_outbound");
    a.href = url.toString();
    if (a.target === "_blank") a.rel = "noopener noreferrer";
  }, true);

  /* ---------- Copy-to-clipboard on code snippets ---------- */
  $$("pre").forEach(pre => {
    if (pre.closest(".code-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.innerHTML = IC.copy + "<span>Copy</span>";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
      } catch {
        const r = document.createRange();
        r.selectNodeContents(pre);
        const sel = getSelection();
        sel.removeAllRanges(); sel.addRange(r);
        document.execCommand("copy");
        sel.removeAllRanges();
      }
      btn.classList.add("copied");
      btn.innerHTML = IC.check + "<span>Copied</span>";
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = IC.copy + "<span>Copy</span>";
      }, 1800);
    });
    wrap.appendChild(btn);
  });

  /* ---------- Last updated (GitHub Pages) ----------
     Set GITHUB_REPO to "username/reponame" to activate. */
  const GITHUB_REPO = ""; // e.g. "ammar/devbyammar.github.io"
  (async function lastUpdated(){
    const slot = $("#lastUpdated");
    if (!slot || !GITHUB_REPO) return;
    const path = location.pathname.replace(/^\//, "") || "index.html";
    try {
      const r = await fetch("https://api.github.com/repos/" + GITHUB_REPO +
        "/commits?path=" + encodeURIComponent(path) + "&per_page=1");
      if (!r.ok) return;
      const j = await r.json();
      if (!j.length) return;
      const d = new Date(j[0].commit.committer.date);
      slot.textContent = "· Updated " + d.toLocaleDateString(undefined,
        { year: "numeric", month: "short", day: "numeric" });
    } catch { /* offline or rate-limited — leave blank */ }
  })();

  /* ---------- Skip-link focus target polish ---------- */
  const main = $("#main");
  if (main) main.addEventListener("click", () => main.focus({ preventScroll: true }));
})();
