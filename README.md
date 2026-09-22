# DevByAmmar — Portfolio

Static front-end portfolio for **Muhammad Ammar** (Hyderabad, PK), hosted on GitHub Pages.
Zero dependencies, zero build step — edit files, push, done.

## File map

```
index.html              Main portfolio page (sections; loads the files below)
projects.js             ★ PROJECT REGISTRY — add/edit projects HERE only
js/
  site-config.js        ★ All contact details, links & WhatsApp messages HERE
  render-projects.js    Builds filter buttons + project cards from projects.js
  main.js               Interaction engine (theme, rail, cursor, animations…)
css/
  style.css             Manifest only — @imports the themed files below
  tokens.css            Colors, type scale, themes (dark/light), base reset
  layout.css            Header, rail, mobile menu, footer, 404
  components.css        Brand, buttons, cards
  sections.css          Hero, marquee, about, services, skills, projects, FAQ…
  motion.css            Preloader, cursor, reveal animations, keyframes
  responsive.css        Mobile rules (max-width: 900px)
project-1/  project-2/  project-3/    Live demo micro-sites
assets/     Icons, logo, og-image     SEO: robots.txt · sitemap.xml · 404.html ·
                                      site.webmanifest · humans.txt · llms.txt
docs/       PRD · TRD · DESIGN · ARCHITECTURE · DSD
```

## Add a new project (3 steps)

1. Create `project-4/index.html` with the demo.
2. Open **`projects.js`**, copy any block inside `PROJECTS`, paste it last,
   update the values (see the commented field guide at the top of the file).
3. Save. The card, filters, and preview appear automatically.

## Change contact details / WhatsApp number / email

Edit **`js/site-config.js`** → every button and link on the site updates
(header, hero, contact section, mobile menu, footer). The WhatsApp message
texts live in `SITE.messages`.

## Change colors or fonts

Edit **`css/tokens.css`** — the whole site derives from the tokens at the top
(`--gold`, `--ink`, `--paper`, themes, type scale).

## Change the marquee / section text

All copy lives directly in `index.html` — search for the sentence you want.

---
© DevByAmmar — hand-written HTML/CSS/JS, no frameworks.
