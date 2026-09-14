# Roopa Marri — Website

Static site, no build step. Open `index.html` in a browser (or serve with `npx serve`).

## Edit content (no coding needed beyond changing text)

| What | Where |
|---|---|
| Phone, hours, delivery fee, address | `js/config.js` |
| Menu items, prices, photos | `js/data.js` (change `image:` URL to swap a photo) |
| Event packages | `js/data.js` |
| Gallery photos | `js/data.js` |
| Reviews | `js/data.js` |
| Colors, fonts, spacing | `css/styles.css` (tokens at top, `:root`) |

All order / reservation / event requests are sent to the business phone (+92 346 2785955)
as pre-filled WhatsApp messages — there is no backend or database.
