# Calculator components

- `Calculator.tsx` owns all numeric state; route files only select context and metadata.
- Find size computes one missing dimension. Find ratio simplifies source dimensions. Resize preserves the original width/height ratio while accepting a new target width or height.
- Explicit transfer buttons preserve exact source inputs when moving to Find size, and transfer displayed rounded pixel dimensions when moving back. Never transfer a Near hint as the exact ratio. Disable transfer for invalid/subpixel/out-of-range results.
- Nine general presets: 16:9, 9:16, 4:3, 3:2, 1:1, 3:4, 4:5, 2:3, 16:10. Match presets by rational equality (16:10 = 8:5).
- `RatioCanvas.tsx`: geometry updates immediately; pointer events are coalesced once per animation frame. Pending frames are flushed on pointer release and canceled on unmount. Resize and ultrawide keep source proportions locked.
- `MediaPreview.tsx`: previews source dimensions from Find ratio/Resize. File selection reads only in the browser, supports JPG/PNG/WebP/GIF/AVIF, rejects over 20 MB and over 50 MP; dimensions reflect browser decoding/orientation. URLs are revoked on replacement/removal/unmount; stale reads cannot replace newer selections.
- Fit uses contain; Fill uses centered cover. Visible area is min(source/target,target/source). Video assumes square pixels. This is a calculator/preview, not a file resizing, crop-export or video-transcoding tool.
- Custom manually edited dimensions show diagrams instead of distorting the uploaded image.
- Navigation uses TanStack Link. Local preview is noindex. Full interactive calculator is enabled after hydration.
- Acceptance and repeat steps: `../../verification/workflows-report.html`. No new unit tests; browser journeys cover the changed behavior.

## Stable layout and page-specific entry (2026-10-17)
- Image/Video lead with MediaPreview: image file input, editable source dimensions and Fit/Fill comparisons. No generic RatioCanvas on media pages. Numeric solve/resize tools remain in a collapsed disclosure.
- Home/Ultrawide retain RatioCanvas; desktop stage stays 460px, mobile 240px. Mode input/result blocks reserve stable geometry; presets scroll horizontally within the card (min-width:0 prevents grid overflow).
- Mode changes use opacity-only 140ms feedback, never animate the entire layout; reduced motion disables this feedback. Canvas drag remains immediate.
- Solve and Resize own independent target values and sides. Re-clicking or returning to Resize never initializes/overwrites the target. Explicit Reset restores both modes. Source dimensions remain shared with Find ratio and media preview.
- Latest checks and initial failed attempts with passing retests are retained in `verification/stability-fix/checks.json`. Report: `verification/stability-fix/report.html`.

Media preview visual refresh: scoped .mp-* styles; keep Fit/Fill math and local file lifecycle intact. Device bezels reserve12px within the stage. Verification: verification/media-design/report.html.

Video fit clarity: shared media readouts distinguish exact match, contain letterboxing direction, and cover crop direction. Exact match uses BigInt cross multiplication; preview percentages remain approximate. Video frames retain realistic device shells with narrow bezels; screen geometry remains independent of shell padding. No exterior ghost outlines; image frames retain their geometry. Latest visual acceptance: `../../verification/device-preview/README.md`. See `../../verification/video-fit-clarity/README.md`.

Image/navigation follow-up: all four image formats use the same neutral stage and outlined target frame; aspect ratios remain true, so matching 16:9 has no internal letterboxing. Removed the image preview-only footnote. Shared navigation uses labeled Lucide icons with a four-column mobile layout. Browser evidence: `../../verification/image-nav/`.

Real-photo acceptance: `../../verification/photo-flow/report.html` includes repeatable 1200×800 fixture, desktop and390px upload/Fit/Fill screenshots and per-frame geometry checks. Copy uses inverted neutral theme tokens; homepage and ultrawide clipboard checks included.

Local SEO follow-up: context-specific Image/Video intro, full Ultrawide H1, real href links in related tools and the homepage ultrawide example. Calculations unchanged. See `../../verification/seo-local/report.html`.
