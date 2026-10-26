# lavimac97.github.io

Personal portfolio of Lavinia Pedrollo. Static site, no build step: GitHub Pages serves it from the root of `main`.

- `index.html`, `style.css`, `script.js` — the page
- `art.json` — the drawing collections shown in the Art section (`art/` holds the images)
- `img/` — project figures

## Redesign

The uploaded Stanford portrait leads the editorial research section. A sticky,
scroll-scrubbed interlude expands a color field and brings drawings into view
before the experimental gallery. Scroll position controls the transition in both
directions without trapping scrolling. Reduced-motion preferences replace the
interlude with a static composition. Research copy and the five collections in
`art.json` are preserved.

Preview with `python3 -m http.server 8765`, then open localhost:8765.
No build or dependencies are required. Gallery filters use pressed-state buttons;
the artwork dialog supports Enter/Space, arrow keys, Escape, focus trapping and
focus restoration. If JavaScript is unavailable the written content and featured
artwork remain readable.

Validation: JavaScript syntax and Git whitespace checks; asset/anchor validation;
comparison with the original research sections and all collection data; browser
inspection at 707px width; collection filtering and keyboard dialog opening,
closing and focus restoration. Wider desktop layouts and OS reduced-motion
emulation were not browser-tested in this session.
