# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Local preview (2026-10-16)

```sh
bun install --frozen-lockfile
bun run dev --host 127.0.0.1 --port 18766 --strictPort
```

Preview: http://127.0.0.1:18766/

Acceptance report: [verification/report.html](verification/report.html). Replay: `ego-browser nodejs < verification/browser-check.mjs`. 17 calculation checks passed; remaining UI checks interrupted by user control. `bun run build` passed. Product implementation unchanged.

## Theme and competitor review

Brand theme unified to `#D96A1B` in both light/dark modes; see [DESIGN.md](DESIGN.md). No calculation logic changed.
Detailed comparison: [calculateaspectratio comparison](../reports/2026-10-16/canvas-competitor-comparison/report.html).
Computed color verification: [theme-results.json](verification/theme-results.json).

## Ultrawide local preview

Open http://127.0.0.1:18766/ultrawide-aspect-ratio-calculator .
Select a real screen resolution (exact reduced ratio) or strict 21:9, choose the known dimension, and scale. This changes numbers only, not display settings or files.
Boundary behavior, presets and acceptance commands are documented in [src/routes/README.md](src/routes/README.md).

Latest UI refinement: homepage remains the main entry, with linked logo and ultrawide breadcrumb. Source presets show true ratios, Use original size restores the selected resolution, and results display complete dimensions. Chrome passed 21 focused checks; evidence: `verification/refinement-results.json`.

Latest precision refinement (2026-10-17): concise approximate canvas labels, collapsed exact details, and dedicated ultrawide examples. See [Chrome acceptance and replay steps](verification/precision-report.html).

Familiar ratio hints: custom shapes close to a standard ratio now show `Near 3:4`, with exact values in precision detail. Chrome checks: `verification/familiar-results.json`; screenshot: `verification/familiar-ratio.png`.

## Current local version — 2026-10-17

Home, Image, Video and Ultrawide are connected by shared navigation. The general calculator adds Resize, exact ratio/result transfer, and nine common presets. Image reads local files and previews fit/crop; Video compares horizontal and vertical screens. Neither exports edited files.

Removed 420 ms geometry interpolation and duplicate drag updates. Chrome and in-app browser switching measurements are recorded with the browser acceptance report below; a local sample is not a guarantee for every device.

[Current acceptance and repeat steps](verification/workflows-report.html) · [Component contracts](src/components/README.md).

When adding new component files, restart Vite if newly introduced Tailwind utilities fail to appear. This occurred during this iteration and was corrected before final desktop/mobile acceptance.

Latest local stability update: Image/Video now have task-specific first screens; generic numeric tools are collapsed below. Stable canvas/results and isolated Resize targets verified on desktop and 390px mobile. See [verification/stability-fix/report.html](verification/stability-fix/report.html).

## SEO workflow and current baseline

[SEO 工作入口](../README.md) · [验收与复盘清单](../SEO验收与复盘清单.md) · [当前页面表与实验简报](../reports/2026-10-16/first-seo-experiment/首个SEO实验执行简报.md)。2026-10-17 文档核对：四页仍为 noindex；canonical、正式 sitemap、About/Privacy 和生产验证列为后续事项。本次文档整合没有执行新的浏览器测试或部署。

## Local SEO infrastructure
Copy `.env.example` to `.env.local` only when configuring a confirmed site origin. Leave `VITE_SITE_URL` blank and `VITE_SITE_INDEXABLE=false` for the current preview. Settings are public build-time values, not secrets. Run `bun run build`, then `bun run preview` for the built Cloudflare Worker at http://127.0.0.1:18767 (local mode, no deployment). The normal development site remains on18766.

`/sitemap.xml` and `/robots.txt` now return200. The preview sitemap intentionally has no URL entries because all pages remain noindex. Domain configuration alone does not turn indexing on. See `src/routes/README.md` for canonical, redirects and release requirements.

## Deployment

Cloudflare Workers SSR 部署和专用 `ubuntu-m3ultra` CI 见 [部署说明](docs/deployment.md)。当前保留 noindex，自定义域名待配置。
