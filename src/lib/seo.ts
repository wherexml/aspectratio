import { canonicalUrl, robotsDirective, type SitePath } from "./site";

/** Shared SSR/client metadata from explicitly configured public site settings. */
export function previewSeoMeta(title: string, description: string, path: SitePath) {
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robotsDirective() },
    ...(canonicalUrl(path) ? [{ property: "og:url", content: canonicalUrl(path)! }] : []),
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "ratio/lab" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export function seoLinks(path: SitePath) {
  const url = canonicalUrl(path);
  return url ? [{ rel: "canonical", href: url }] : [];
}
