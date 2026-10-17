export const SITE_PAGES = ["/", "/image-aspect-ratio", "/video-aspect-ratio", "/ultrawide-aspect-ratio-calculator"] as const;
export type SitePath = typeof SITE_PAGES[number];
export type SiteConfig = { origin: string | null; indexable: boolean };

/** Public build-time values only. Never derive canonical URLs from request Host. */
export function parseSiteConfig(env: Record<string, string | undefined>): SiteConfig {
  const raw = env["VITE_SITE_URL"]?.trim() || "";
  const flag = env["VITE_SITE_INDEXABLE"]?.trim() || "false";
  if (flag !== "false" && flag !== "true") throw new Error("VITE_SITE_INDEXABLE must be true or false");
  let origin: string | null = null;
  if (raw) {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/" || url.port || !url.hostname.includes(".") || /^(localhost|127\.|0\.|\[)/.test(url.hostname) || url.hostname.endsWith(".localhost")) {
      throw new Error("VITE_SITE_URL must be a public HTTPS origin without credentials, port, path, query or fragment");
    }
    origin = url.origin;
  }
  if (flag === "true" && !origin) throw new Error("An indexable site requires VITE_SITE_URL");
  return { origin, indexable: flag === "true" };
}

export const site = parseSiteConfig({
  VITE_SITE_URL: import.meta.env?.["VITE_SITE_URL"],
  VITE_SITE_INDEXABLE: import.meta.env?.["VITE_SITE_INDEXABLE"],
});
export const robotsDirective = (config: SiteConfig = site) => config.indexable ? "index, follow" : "noindex, nofollow";
export const canonicalUrl = (path: SitePath, config: SiteConfig = site) => config.origin ? `${config.origin}${path}` : null;
const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export function sitemapXml(config: SiteConfig = site) {
  const urls = config.indexable && config.origin ? SITE_PAGES.map(path => `  <url><loc>${xmlEscape(canonicalUrl(path, config)!)}</loc></url>`).join("\n") : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
export function robotsTxt(config: SiteConfig = site) {
  return `User-agent: *\nAllow: /\n${config.indexable && config.origin ? `\nSitemap: ${config.origin}/sitemap.xml\n` : ""}`;
}
