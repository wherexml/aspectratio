# Aspect Ratio Canvas theme

Single brand source: `--brand: #D96A1B` in `src/styles.css`.
Both light and dark modes alias primary, frame, signal and ring to this token.
Use `color-mix` with this same token for subtle surfaces; do not add independent orange hues.
Solid brand buttons use dark text. Error colors and neutral text remain semantic.
The logo uses the opaque brand color; hover uses an outline rather than brightness shifts.

Verification: `verification/theme-results.json` records computed colors in both themes and a 390px overflow check. `verification/theme-build.log` records the production build. Screenshot capture timed out, so no screenshot-based visual acceptance is claimed.

Detailed feature comparison: `../reports/2026-10-16/canvas-competitor-comparison/report.html`.

## Media previews (2026-10-17)
MediaPreview uses neutral dotted stages, hatched empty areas, subtle brand-tinted source frames, neutral frame edges and monitor/phone bezels. Brand remains --brand. Keep .mp-* selectors scoped; stage height stays256px. Readouts distinguish exact fit, empty-space direction and crop direction. Fit reports frame coverage; Fill reports source retained. No unlabeled progress meter. Evidence: verification/media-design/report.html.

Theme follow-up: light stage and result surfaces use light neutral tokens with foreground text; dark tokens remain dark. Decorative orange corner pseudo-elements removed from all media previews. Browser checks and screenshots: `verification/theme-followup/`.

Video clarity: retain realistic monitor/phone shells with narrow 5px bezels, metallic monitor stand, phone camera island and home indicator. Screen aperture preserves the exact target ratio independently of the shell. Video stage stays 304px high; monitor screen is up to 400px wide and phone screen 252px tall. No exterior crop ghosts. Empty screen areas carry labels; exact-fit messaging uses rational equality. Evidence: `verification/device-preview/README.md`.

Copy action uses theme foreground as its background and theme background as its text/icon color for strong contrast in both themes. This neutral control replaces the earlier solid orange Copy button. Browser evidence: `verification/photo-flow/report.html`.

## Browser identity
`public/favicon.svg` reuses the header's exact overlapping horizontal/vertical frame geometry and brand #D96A1B. Its neutral outline follows browser light/dark appearance. `public/favicon.ico` contains 16/32/48/64px raster fallbacks. Root head links use a versioned URL to refresh the old Lovable icon cache; all routes inherit this identity. Validate both public assets and all route head links after deploying.

## General ratio presets
Use a three-column, three-row selector with a thumbnail, ratio and concise use label per button. Preserve the separate Ultrawide source layout. Behavior and acceptance: [component contract](src/components/README.md#general-preset-contract-2026-10-23).
