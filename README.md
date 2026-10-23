<p align="center"><img src="public/favicon.svg" width="96" alt="Aspect Ratio Calculator icon"></p>
<h1 align="center">Aspect Ratio Calculator</h1>
<p align="center">Calculate dimensions. Keep the exact proportions.</p>
<p align="center"><a href="https://imageaspectratio.com/">Open the calculator</a> · <a href="https://github.com/wherexml/aspectratio/issues">Report an issue</a> · <a href="LICENSE">MIT license</a></p>

A free, browser-based calculator for image, video and ultrawide dimensions. Calculate a missing width or height, reduce dimensions to an exact ratio, and preview how content fits a different frame.

## A closer look

### Calculate without losing precision

Switch between **Calculate size**, **Aspect ratio** and **Resize**. Choose one of nine visible presets, enter your dimensions and copy the result. Exact fractions remain available alongside rounded pixel values.

### Preview an image in a different frame

Open [Image aspect ratio](https://imageaspectratio.com/image-aspect-ratio), select a local image and inspect its dimensions. Compare **Fit** and **Fill** to see padding or the visible crop area. The selected image is read locally in your browser.

### Compare video and ultrawide proportions

[Video aspect ratio](https://imageaspectratio.com/video-aspect-ratio) compares horizontal and vertical frames using entered dimensions. The [Ultrawide calculator](https://imageaspectratio.com/ultrawide-aspect-ratio-calculator) distinguishes exact screen-resolution ratios from the familiar 21:9 category.

## Features

- **Exact ratio math:** BigInt fractions preserve the calculation; rounding is labeled.
- **Nine common presets:** square, portrait, landscape, social post and vertical video shapes.
- **Related workflows:** carry results between dimension, ratio and resize modes.
- **Fit/Fill previews:** inspect framing before deciding how to prepare an image or video.
- **Responsive interface:** shared navigation and system, light and dark themes.

These tools calculate numbers and preview framing. They do **not** export resized or cropped images, transcode videos, or change display settings. Video calculations assume square pixels.

## Run locally

Verified with **Bun 1.3.14** and **Node.js 22.23.1**. Dependencies are pinned in `bun.lock`.

```sh
git clone https://github.com/wherexml/aspectratio.git
cd aspectratio
bun install --frozen-lockfile
npm run dev -- --host 127.0.0.1 --port 18786 --strictPort
```

Open [the local preview](http://127.0.0.1:18786/). Development is noindex by default. Do not put credentials in public `VITE_*` settings.

## Build from source

```sh
bunx tsc --noEmit
npm run build
node scripts/prepare-worker.mjs
npm run preview
```

The built Worker runs locally at [127.0.0.1:18767](http://127.0.0.1:18767/). Production builds use `.env.production`, including the public canonical domain and indexability settings. Run the HTTP acceptance checks in another terminal:

```sh
python3 scripts/verify-http.py http://127.0.0.1:18767 https://imageaspectratio.com indexable
```

The application uses React, TypeScript, TanStack Start and Tailwind CSS, with Cloudflare Workers SSR and Static Assets. Deployment is manual; pushing to GitHub does not publish the site. See [deployment and rollback](docs/deployment.md) and [source reproduction](docs/release-reproduction.md).

## Privacy and scope

Local image selection is processed in the browser. The application does not upload selected image files for its preview. Hosting requests are subject to the live site's [Privacy](https://imageaspectratio.com/privacy) and [Terms](https://imageaspectratio.com/terms) pages. Avoid including private images, credentials or account information when reporting an issue.

## Project documentation

- [Component workflows](src/components/README.md)
- [Routes and SEO contracts](src/routes/README.md)
- [Design principles](DESIGN.md)
- [Contributor instructions](AGENTS.md)

New content, documentation, code comments and GitHub records use English. Older documents are being updated incrementally. Historical verification paths refer to local evidence and are not required to build a checkout.

## Project status

Maintained by [wherexml](https://github.com/wherexml). Originally exported from [Lovable](https://lovable.dev); provenance is recorded in `LOCAL-EXPORT.json`. The repository remains connected to Lovable, so published Git history must not be rewritten.

The public site is available at **imageaspectratio.com**. Search Console ownership and sitemap submission are configured; indexing requests do not guarantee inclusion or ranking. [Report an issue](https://github.com/wherexml/aspectratio/issues) with the page, input dimensions, expected result and steps to reproduce.
