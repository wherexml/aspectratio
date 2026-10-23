# Production source reproduction

## Baseline

Commit `333c654` captures the previously uncommitted production-domain configuration used by active Worker version `3579388d-8d51-4550-b42e-e1ecc9669255`. It includes the public origin, indexability, Custom Domain routes, loopback preview host and production-alias redirects.

The subsequent repository rename to `wherexml/aspectratio` updates the source and llms.txt links. The public website domain remains `imageaspectratio.com`. This source-only update does not redeploy the Worker; the existing live repository links resolve through GitHub's rename redirect. Checkout `333c654` to reproduce the prior live application configuration, or use current main for the new repository links.

## Verification method

- Export only tracked project files into an isolated temporary directory; do not copy node_modules, private environment files or local verification artifacts.
- Install with `bun install --frozen-lockfile` (Bun 1.3.14, Node.js 22.23.1).
- Run TypeScript validation, the production build and `scripts/prepare-worker.mjs`.
- Start the built Worker on a five-digit loopback port and run `scripts/verify-http.py` in indexable mode.
- Verify live HTTP responses independently, including canonical URLs, robots, sitemap, redirects and 404 behavior.

A successful source build establishes application reproducibility, not byte-for-byte identity of bundled output or replication of external Cloudflare/DNS/GSC account state. Deployment still requires authorized account access. No GitHub CI/CD is restored.

Detailed local outputs are stored under `verification/release-reproduction/`; this directory is intentionally excluded from Git. See [deployment instructions](deployment.md) for repeatable commands.
