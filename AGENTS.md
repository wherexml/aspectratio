<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Aspect-ratio math lives in src/lib/ratio.ts using BigInt fractions; keep it exact and covered by src/test/ratio.test.ts (floats only for the preview drawing).

- Theme rules: see `DESIGN.md`. Keep all brand emphasis sourced from `--brand`; preserve separate semantic error and neutral colors.

- Shared calculator workflows and media preview contracts: `src/components/README.md`; current browser acceptance: `verification/workflows-report.html`.

- Stability regression: preserve per-mode target/side; test repeated Resize clicks and desktop/mobile geometry. See `verification/stability-fix/report.html`.

- Preview SEO metadata lives in `src/lib/seo.ts`; retain noindex/nofollow until production release is explicitly scoped. Route metadata contract: `src/routes/README.md`.
- Site origin/indexability and crawl endpoint contracts: `src/lib/site.ts`, `src/server.ts`, `.env.example`, `src/routes/README.md`. Do not populate production URLs from request Host or enable indexing to make a local sitemap nonempty.
- 部署边界及 CI/CD 移除状态：见 `docs/deployment.md`；部署需明确授权。
- Browser brand assets: `public/favicon.svg` and ICO fallback; keep geometry consistent with the header logo and follow `DESIGN.md` browser identity contract.
