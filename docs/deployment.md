# Cloudflare 部署与 Ubuntu CI

## 目标与环境

- 私有仓库：https://github.com/wherexml/aspect-ratio-canvas ，分支 `main`。
- Cloudflare Worker：`aspect-ratio-canvas`；目标地址 https://aspect-ratio-canvas.geekmooc.workers.dev 。
- 构建目标：TanStack Start SSR + Cloudflare Workers Static Assets。部署 `.output/server/wrangler.json`，不能仅上传静态目录。
- `scripts/prepare-worker.mjs` 固定独立 Worker 名称、账号和 compatibility date，避免构建器默认名称覆盖其他服务。
- `VITE_SITE_URL` 为目标 HTTPS origin；`VITE_SITE_INDEXABLE=false` 保留。自定义域名未配置；确定域名后修改流水线 origin 并重新构建。
- noindex 时保留 canonical，但 sitemap 合法且为空，robots 允许抓取以便读取 noindex，不宣告 sitemap。

## 专用 CI 机器

OrbStack `ubuntu-m3ultra`，Ubuntu ARM64。使用无 sudo 权限的 `cicd` 用户，项目专属 runner `ubuntu-m3ultra-aspect-ratio`。不清理机器上其他既有工作负载。

- 服务：`ratio-ci-runner.service`，开机自启。
- Runner 程序：`/opt/github-runner`；工作区：`/var/lib/cicd-work`。
- Runner 凭据：`/etc/credstore.encrypted/ratio-*` 经 systemd-creds 主机密钥加密；启动时仅解密到 `/run/ratio-ci-runner` 内存文件系统。
- OrbStack 的 LXC systemd drop-in 会清空 LoadCredential，故用受限 root ExecStartPre 解密，再以 cicd 运行。主机密钥由 root 保管；这不抵御主机 root 被攻破。
- 检查：`orb -m ubuntu-m3ultra sudo systemctl status ratio-ci-runner`。
- runner 仅服务本私有仓库；工作流不监听外部 PR，避免不受信任代码进入本机。

## 流水线

`.github/workflows/deploy.yml` 在 main push / workflow_dispatch 执行：

1. ARM64 Ubuntu runner 安装固定 Bun 1.3.11、Wrangler 4.151.1。
2. 冻结 lockfile 安装、TypeScript 检查、生产构建。
3. 本地 18769 端口运行生产 Worker，执行 `scripts/verify-http.py`。
4. 使用 GitHub Actions 加密 Secret `CLOUDFLARE_API_TOKEN` 部署。
5. 对公网 URL 复验四路由、canonical、noindex、sitemap、robots、308 和 404；上传 `deployment-evidence-*` 构建产物，保留 14 天。

GitHub Token 只在部署步骤注入。Cloudflare token 授予指定账号 Workers Scripts Edit；该权限是账号级，非单 Worker 级。不要将 token 写入源码、日志或本地明文文件。

## 运行条件与回滚

Mac 与 OrbStack Ubuntu 必须运行并联网，否则 GitHub 任务排队。Cloudflare 已部署网站不依赖本机持续在线。流水线串行部署，不中断正在部署的任务。回滚优先使用 Cloudflare Worker 既有版本回滚，或通过 revert commit 重新部署；不要改写已推送历史。

HTTP 验收使用明确的 `AspectRatioCanvas-DeploymentCheck/1.0` User-Agent 和 15 秒请求超时。公网 Cloudflare 对 Python 默认 User-Agent 返回过 403/1010；浏览器与明确标识的检查器均能访问，不需关闭安全防护。
