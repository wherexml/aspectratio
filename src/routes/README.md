# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Aspect ratio tools

- `/`: general numeric calculator, simplify ratio and compute missing dimension.
- `/ultrawide-aspect-ratio-calculator`: locked source ratios: strict 21:9; 3440x1440 = 43:18; 2560x1080 and 5120x2160 = 64:27; 3840x1600 = 12:5.
- Both routes share the `Calculator` component (`src/components/Calculator.tsx`) and BigInt rational math. Switching ultrawide presets preserves the known dimension. Reset restores width 3440 and 43:18 on the ultrawide route.
- If either resulting dimension is below 1px, show a warning and disable copy. Exact values remain visible. Preview clamping is disclosed; it never changes the calculation.
- General canvas pointer/keyboard controls change ratios without preset snapping. Ultrawide canvas is read-only to preserve source proportions.
- Keep noindex during local preview. Production domain/canonical and index settings are a separate release step.
- E2E replay: `ego-browser nodejs < verification/ultrawide-check.mjs`. Results are written incrementally to `verification/ultrawide-results.json`; a browser-control stop is not a product failure.

## Navigation and full result refinement
- Brand link always returns home. All four tools use a shared navigation bar and client-side links.
- Ultrawide source buttons show exact ratios; strict 21:9 occupies its own row and has no source-size action.
- Use original size restores the selected source width or height according to the current known-side selection; it keeps the ratio and side unchanged.
- Solve results show full width x height plus px, using exactly the same dimension string as clipboard output. Ratio mode stays a simplified ratio.
- Chrome verification: `verification/refinement-results.json` (21 checks passed), desktop and 390px screenshots in `verification/refinement-*.png`. Types and build passed; no deployment.
- Repeat: change known size, restore each of four source sizes in Width and Height modes; compare visible result with copied text; verify strict mode hides source-size button; return home via logo and breadcrumb; check both pages at 390px.

## Compact precision display (2026-10-17)
- Canvas preserves short exact target ratios (including 21:9 and 2.39:1). Other custom ratios use at most two decimal places with an approximation sign when rounded; tiny positive ratios display <0.01, never zero. Exact simplified ratios remain available in Find ratio.
- Solve results default to complete rounded pixel dimensions. Precision detail starts closed in both modes and exposes the exact fraction/ratio and decimal expansion. Presentation formatting never feeds back into calculation.
- Ultrawide examples cover all four source resolutions at half size and strict21:9 at3440px.
- Repeatable Chrome acceptance: `../../verification/precision-report.html`. 24 passing checks; one pointer location miss corrected and retested.

## Familiar ratio hints
- Common matches use exact rational equality. Otherwise, within 3% relative difference, show `Near 3:4` (or the nearest common ratio), never an exact label. Portrait 3:4 and 2:3 are included.
- Actual ultrawide ratios 43:18, 64:27 and 12:5 keep their exact labels.
- Find ratio shows the familiar approximation with an explicit not-exact note; precision details and clipboard retain the exact reduced ratio. Calculations and canvas proportions are unchanged.
- Chrome evidence: `verification/familiar-results.json` and `verification/familiar-ratio.png` at project root.
- Replay: enter 0.7597:1 at width1920 (Near3:4,1920x2527), expand details; enter3:4 (exact),1.2:1 (6:5,no forced match); Find ratio1920x2527 (Near3:4,copy1920:2527); check ultrawide43:18 remains exact.

## Image, video and workflow expansion (2026-10-17)
- `/image-aspect-ratio`: local image dimension detection and 1:1, 4:5, 9:16, 16:9 fit/center-crop preview.
- `/video-aspect-ratio`: numeric dimensions and 16:9 / 9:16 screen simulator.
- Shared state and rendering contract: [components/README.md](../components/README.md).
- Current acceptance: [workflows-report.html](../../verification/workflows-report.html).

Latest local stability update: Image/Video now have task-specific first screens; generic numeric tools are collapsed below. Stable canvas/results and isolated Resize targets verified on desktop and 390px mobile. See [acceptance](../../verification/stability-fix/report.html).

## Local SEO metadata (2026-10-17)
All four routes use `src/lib/seo.ts` previewSeoMeta: unique title/description plus matching OG/Twitter text. Noindex/nofollow is mandatory for this local version. No production canonical/domain or sitemap is guessed. Image highlights local-photo previews; Video highlights dimension-based screen simulation; Ultrawide has the full H1. Evidence: `../../verification/seo-local/report.html`.

## Site configuration and crawl endpoints (2026-10-17)
- `src/lib/site.ts` is the public build-time source of truth. `.env.example` documents `VITE_SITE_URL` (blank until confirmed HTTPS origin) and `VITE_SITE_INDEXABLE=false` (default). Vite rejects malformed origins, invalid booleans and indexability without an origin. Rebuild after changing values.
- With no origin, omit canonical/og:url instead of emitting a fake or loopback URL. With an origin, each known route gets its own canonical and og:url, without query parameters.
- Preview always sends noindex/nofollow in page metadata and HTML X-Robots-Tag. A configured domain alone never enables indexability.
- `src/server.ts` serves GET/HEAD `/sitemap.xml` and `/robots.txt` dynamically. Sitemap is a valid empty urlset while non-indexable; only an explicitly indexable configuration includes the four known canonical URLs and a robots Sitemap directive. No invented lastmod values.
- GET/HEAD known routes with trailing slashes redirect 308 to slashless paths, preserving query strings. Unknown routes retain 404. No Host-based canonical or cross-host redirect.
- Default build targets Cloudflare. `bun run preview` uses pinned Wrangler in local mode at 127.0.0.1:18767; it does not deploy. The previous vite preview command looked for a different output layout and returned 500.
- Evidence and repeatable HTTP checks: `verification/seo-infrastructure/`. Formal domain, indexability approval, production deployment and GSC remain separate release work.
