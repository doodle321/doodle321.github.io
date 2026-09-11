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

  function projectCard(p){
    return `
      <article class="project reveal" data-cat="${p.category}">
        <div class="project-preview" data-file="${p.file}" role="link" aria-label="Open ${p.title} live demo" style="cursor:pointer">
          <iframe src="${p.file}" loading="lazy" title="${p.title} preview" scrolling="no" tabindex="-1"></iframe>
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
