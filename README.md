# Rhea Solano — Portfolio Site

A single-page, dark-navy creative portfolio for a designer/marketer working across
graphic design and digital campaign strategy. Built as one self-contained
`index.html` — vanilla HTML, CSS and JS, no build step, no dependencies besides
two Google Fonts.

## Run it

Just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## What's inside

One file, organized top-to-bottom to match the page:

- **Tokens & base styles** — CSS custom properties for color, type and spacing at the top of the `<style>` block.
- **Nav / hero / about / gallery / marketing / process / metrics / marquee / contact** — each in its own commented CSS section and its own labelled block in the `<script>`.
- All interactivity (filters, modal, carousel, flowchart, table sort/search, marquee, magnetic button, form) lives in one IIFE at the bottom of the file, split into clearly commented sections.

## Swapping in real content

**Copy & bio** — edit the text directly inside the relevant `<section>` in the HTML (hero headline, About paragraphs, contact copy).

**Gallery work** — edit the `works` array near `GALLERY DATA` in the script. Each entry takes `title`, `cat` (branding/social/print/illustration — must match a filter button's `data-filter`), `tag`, `size` (`''`, `'wide'`, or `'tall'` for bento variety), a placeholder `color`, `desc`, and `tools`. To use real images instead of the gradient placeholders, replace the `background:linear-gradient(...)` inline style on `.card-bg` with `background-image:url('assets/your-image.jpg')`.

**Marketing mockups** — edit the `mockups` array near `MARKETING CAROUSEL`. Same idea: swap the gradient on `.device-screen` for a real screenshot via `background-image`.

**Process stages** — edit the `stages` array near `FLOWCHART`. `track` controls the color coding (`creative` / `data` / `distribution`).

**Metrics table** — edit the `rows` array near `METRICS TABLE`. `trend` is a small array of numbers used to draw the sparkline.

**Tools marquee** — edit the `tools` array near `MARQUEE`.

**Assets folder** — if you're adding real images, create an `assets/` folder next to `index.html` and reference paths like `assets/marrow-brand.jpg`.

**Contact form** — currently client-side only (shows a confirmation message on submit, no data is sent anywhere). Wire `#contactForm`'s submit handler up to your form backend of choice (Formspree, a serverless function, etc.) when you're ready to collect real submissions.

## Accessibility notes already built in

- `prefers-reduced-motion` disables the custom cursor, mouse-follow hero gradient, parallax and magnetic-button effect.
- The gallery modal traps focus behavior via `Escape`-to-close and returns focus to the trigger card on close.
- Flowchart stages are keyboard-focusable (`Tab` + `Enter`/`Space`) and carry `aria-label`s.
- Table search field and export button are labelled for screen readers.
- Color contrast was set with WCAG AA in mind for both the navy and parchment sections — re-check with a contrast checker if you change the palette.

## Notes

- No external JS libraries are used — the "GSAP-style" scroll reveals, the flowchart line-draw, and the carousel are all done with `IntersectionObserver` and CSS transitions to keep the file dependency-free. If you'd rather use GSAP/ScrollTrigger for more elaborate sequencing, it's a drop-in addition via a CDN `<script>` tag.
- Placeholder imagery is CSS gradients keyed to each project's color, so the page has zero network dependency on stock-image services. Swap in real photography whenever it's ready.
