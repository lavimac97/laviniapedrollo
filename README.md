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

### Interactive portrait

`portrait.js` adds three optional portrait modes. Mouse position selects Research
(upper left), Engineering (upper right), or Art (lower area), with a scan lens,
localized blueprint grid and subtle tilt. Selecting a marker pins its mode;
Reset or Escape clears it. Native buttons support touch and keyboard. Reduced
motion disables tilt and the moving lens/grid. Without JavaScript, the original
portrait remains visible without inert controls. This is a decorative effect;
no camera access, face recognition, or visitor tracking is used.

Verified in the local browser: all three mode selections, Space-key activation,
Escape reset, selected-button states, loaded portrait, and no horizontal overflow
at 707px. JavaScript syntax and whitespace checks pass.

Companions now have keyboard-accessible reaction buttons: the alien lifts a star,
the robot assembles a miniature frame, and the art creature splashes neon ink.
Their eyes follow mouse movement within the portrait; reduced-motion preferences
keep eyes and reactions static. Reactions finish after 1.4 seconds, with no
persistent animation loops or accumulating particles. Escape returns focus to
the portrait controls before hiding a focused companion. The stats and About
section now extend the opening’s ink-black, mint, blue and lilac palette.
Verified all three keyboard reactions, one-visible-companion state, Escape focus
restoration, and About layout without horizontal overflow at 1063px.

### Refined visual system

`experience.css` and `experience.js` extend the neon palette through research,
projects, publications and contact. New visitors default to dark; existing theme
preferences are retained. Research figures stay beside their explanations on
larger screens, project panels have a pointer-positioned spotlight, and a thin
header progress indicator tracks the document, including gallery height changes.
The interlude includes orbital outlines driven by the existing scroll progress.
Pointer and scroll updates use requestAnimationFrame; no animation libraries or
new dependencies are needed. Reduced-motion styles suppress spatial effects.

Validation: syntax checks for all three JavaScript files; unique IDs, local asset
and anchor checks; preserved collection data; browser inspection of research in
both themes, project panels and the interlude at 1063px without horizontal
overflow or broken loaded images. This pass did not emulate smaller viewports
or OS reduced-motion settings in the browser.

The CrossMEP research card embeds the live Generator Studio in a lazy-loaded,
sandboxed iframe. Its read-only desktop viewport scales to the card width; the
accessible overlay opens the CrossMEP repository in a new tab. The separate
Generator Studio link opens the interactive application. This preview requires
the externally hosted Studio to be available. Verified the live drawing and 3D
view render in the browser and the overlay targets the intended GitHub URL.

### AI portrait transformations (current interaction)

This supersedes the earlier SVG companion and CSS-filter playground. Original,
Tech, Art and Monsters now crossfade between the uploaded photograph and three
AI-generated edits of that photograph, stored in `img/portrait-*.jpg`. The edits
were generated with the built-in image generation tool, preserving identity,
pose and composition as closely as possible; they are creative variations, not
pixel-aligned facial morphs. No AI service is called by the website.

Hover across the photo or its style buttons to preview; click/tap a style to pin
it, or select Original/press Escape to restore the uploaded photo. Images are
decoded before display, stale asynchronous selections are ignored, and reduced
motion disables the crossfade. The untouched original is the default and remains
available if JavaScript or an edit fails to load. All three edits loaded in the
browser; Tech/Art/Monsters selection and Escape reset were verified, with no
horizontal overflow at 1063px.
