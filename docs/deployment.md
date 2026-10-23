# Cloudflare deployment

## Production configuration

- Canonical origin: `https://imageaspectratio.com`.
- Worker: `aspect-ratio-canvas`, with apex and `www.imageaspectratio.com` Custom Domains.
- Public build settings: `.env.production` sets `VITE_SITE_URL` and `VITE_SITE_INDEXABLE=true`. Development remains noindex by default.
- Eight pages share the production origin in canonical, Open Graph, JSON-LD and sitemap. `public/llms.txt` uses the same origin.
- The server redirects explicitly listed production aliases (www, legacy workers.dev, and HTTP apex) to HTTPS apex with status 308, preserving path and query. Local and unknown hosts are not redirected. Existing trailing-slash normalization and 404 handling remain active. Workers Assets serves static files directly.
- `scripts/prepare-worker.mjs` declares the Worker account, name, compatibility date and Custom Domains. The local `dev.host` prevents Wrangler from inferring a public upstream and producing a redirect loop.
- Verified active version: `3579388d-8d51-4550-b42e-e1ecc9669255`, serving 100% of traffic on 2026-10-23. Initial domain migration: `badf7b79-3049-4b12-9b08-e37f5f8e608f`; pre-migration: `088d17ba-1c78-42ec-b073-4941aa79c7b4`.
- Deployment is manual. GitHub CI/CD remains removed; pushing a commit does not deploy it.

## Build and verify from a clean checkout

Use the committed `bun.lock`; do not depend on an existing node_modules directory or private environment files. Verified toolchain: Bun 1.3.14 and Node.js 22.23.1.

```sh
bun install --frozen-lockfile
bunx tsc --noEmit
npm run build
node scripts/prepare-worker.mjs
npm run preview
# In another terminal:
python3 scripts/verify-http.py http://127.0.0.1:18767 https://imageaspectratio.com indexable
```

The production build is a TanStack Start SSR Worker with Static Assets. Do not upload only the static directory. Build settings contain no credentials. Use existing authorized Cloudflare credentials; never commit or log secrets.

Only after deployment authorization:

```sh
npm exec --yes --package=wrangler@4.151.1 -- wrangler deploy --config .output/server/wrangler.json
python3 scripts/verify-http.py https://imageaspectratio.com https://imageaspectratio.com indexable
```

Verify alias redirects, deep links, query preservation, assets and relevant browser workflows after publishing. The HTTP checker uses an explicit deployment-check User-Agent and a timeout. Keep security protections enabled.

DNS, certificates, Custom Domain bindings and Search Console verification are external account state. A Git clone reproduces application configuration, not ownership of these resources. The preparation script declares the domain routes; a new deployment still needs account permissions.

## Search Console and evidence

The Domain property was verified using DNS TXT. The sitemap was read successfully with eight discovered pages. The homepage and Image, Video and Ultrawide pages all received successful indexing requests on 2026-10-23. Requests are not proof of indexing. Keep the ownership TXT record and verify actual indexing separately.

Local evidence directories (not build inputs or files shipped in this repository):

- `verification/domain-release/`: initial domain migration, redirects and browser acceptance.
- `verification/gsc-launch/`: final repository links, publication, ownership verification and four indexing requests.
- `verification/release-reproduction/`: clean-checkout source verification.

## Rollback

Record the active version before any deployment. A Worker version rollback does not revert independent DNS or Custom Domain bindings. The pre-migration version uses workers.dev canonical URLs, so rolling back that far also reverts the SEO migration. Preserve later changes and unrelated resources. Git revert changes source only; it does not deploy. Never rewrite published Git history because the repository is connected to Lovable.

## Historical implementation notes

The notes below describe earlier stages and may contain superseded preview settings, page counts, repository names and GSC status. The current sections above take precedence. Older documents are being updated incrementally.

## 当前状态（2026-10-23）

按用户要求移除 `.github/workflows/deploy.yml`，不再通过 main push 或 workflow_dispatch 自动执行构建、验收与部署。对应的 CI/CD 结果跟进任务也已删除。提交代码不等于发布；后续部署需明确授权。

已部署的 Cloudflare Worker 保留。此前专用 Ubuntu runner 的注册、服务、安装目录及加密凭据未在本次删除范围内，不应视为已经卸载。历史运行记录可在 GitHub Actions 中查询。

## 保留的部署约束

- 仓库：https://github.com/wherexml/imageaspectratio.com ，分支 `main`。
- Worker：`aspect-ratio-canvas`；地址 https://aspect-ratio-canvas.geekmooc.workers.dev 。
- 构建目标：TanStack Start SSR + Cloudflare Workers Static Assets；部署入口为 `.output/server/wrangler.json`，不能仅上传静态目录。
- `scripts/prepare-worker.mjs` 固定独立 Worker 名称、账号和 compatibility date，避免覆盖其他服务。
- 构建前配置 `VITE_SITE_URL` 为目标 HTTPS origin；保留 `VITE_SITE_INDEXABLE=false`。自定义域名尚未配置。
- noindex 时保留 canonical，sitemap 合法且为空，robots 允许抓取以读取 noindex，不宣告 sitemap。
- 凭据不得写入源码、日志或本地明文文件。

## 后续人工发布验收

获得发布授权后，执行类型检查、生产构建及 Worker 配置准备，在五位 loopback 端口运行产物，再用 `scripts/verify-http.py` 检查四路由、canonical、noindex、sitemap、robots、308 与 404。发布后另行执行公网验收，并保存可复核证据。上述步骤是发布契约，本次移除 CI/CD 未执行新部署。

HTTP 检查器使用明确的 `AspectRatioCanvas-DeploymentCheck/1.0` User-Agent 和 15 秒请求超时。保留既有安全防护。

回滚可采用 Cloudflare Worker 既有版本；Git revert 只回退源码，不会再自动触发部署。不要改写已推送历史。

## 索引就绪验收（2026-10-23）

Steve 已确认本轮范围：先完善索引配置与验收，保留预览 noindex。当前 workers.dev 地址不因本轮优化变为正式可索引站点；不部署、不提交 GSC。现有索引生成逻辑无需修改，本轮扩展的是双模式 HTTP 验收。

`verify-http.py BASE ORIGIN [preview|indexable]` 支持两种发布配置，省略模式仍按 preview 验收。indexable 模式要求四个 canonical URL 完整进入 sitemap、robots 宣告该 sitemap、四页及带查询参数首页返回 index/follow 且 HTTP 头不含 noindex。两种模式都检查 308、404 和抓取端点 HEAD。

本地可用临时环境变量 `VITE_SITE_URL=<已确认的 HTTPS origin> VITE_SITE_INDEXABLE=true npm run build` 验证可索引产物；这不修改环境默认值，也不部署。正式启用前须确定最终域名及发布范围。预览环境继续 false。验收记录：`verification/seo-copy-index/README.md`。


## Updated sitemap and entity contract (2026-10-23)

This supersedes the earlier preview sitemap declaration rule: when a public origin is configured, robots.txt declares its sitemap even in noindex mode. Preview sitemap remains empty. Indexable mode includes seven routes (four tools and About, Privacy, Terms). No origin means no fabricated sitemap URL.

Contact remains unset at the user request; no empty contact link is rendered. Site identity is Aspect Ratio Calculator. Tool pages have WebSite + WebApplication JSON-LD; information pages have WebSite + WebPage. No invented author, date, sameAs or ratings. Evidence: verification/seo-entities/README.md.

## 当前公开索引发布（2026-10-23，覆盖上文预览发布约束）

Steve 已明确授权当前 workers.dev 地址开放索引并部署。`.env.production` 固定公开 origin 和 `VITE_SITE_INDEXABLE=true`，生产构建默认采用该配置；开发模式及未配置环境仍默认 noindex。后续发布不能再照旧覆盖为 false，除非明确回退到预览。公开验收使用 `verify-http.py BASE ORIGIN indexable`，覆盖 7 个页面、HTML/HTTP 索引指令与完整 sitemap。开放索引不等于搜索引擎已经收录；未提交 GSC。

首页采用 MDN 原文定义及常见比例参考，AITDK 检测规则与发布证据见 `verification/indexable-citations/README.md`。

## 开源及身份完善（2026-10-23）

用户授权仓库按当前域名命名并公开：`wherexml/aspect-ratio-canvas.geekmooc.workers.dev`，MIT 许可证，Contact 使用公开 GitHub Issues。维护者为公开账户 wherexml。页脚标明实际内容更新时间，JSON-LD 使用相同 dateModified，不自动取构建时间。新增 Contact 后 sitemap 与 HTTP 验收覆盖 8 个页面。llms.txt 是用途及入口说明，不代表 AI 搜索准入或引用承诺。上述内容覆盖早期 Contact 留空和缺少作者/日期的记录。
