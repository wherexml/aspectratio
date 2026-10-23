# Cloudflare 部署边界

## 当前状态（2026-10-23）

按用户要求移除 `.github/workflows/deploy.yml`，不再通过 main push 或 workflow_dispatch 自动执行构建、验收与部署。对应的 CI/CD 结果跟进任务也已删除。提交代码不等于发布；后续部署需明确授权。

已部署的 Cloudflare Worker 保留。此前专用 Ubuntu runner 的注册、服务、安装目录及加密凭据未在本次删除范围内，不应视为已经卸载。历史运行记录可在 GitHub Actions 中查询。

## 保留的部署约束

- 仓库：https://github.com/wherexml/aspect-ratio-canvas ，分支 `main`。
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
