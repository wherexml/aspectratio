import { canonicalUrl, robotsDirective, type SitePath } from "./site";

export const REPOSITORY_URL = "https://github.com/wherexml/aspectratio";
export const MAINTAINER = { "@type": "Person", name: "wherexml", url: "https://github.com/wherexml" };
// Actual content review date; never derive this from build time.
export const CONTENT_UPDATED = "2026-10-23";

export const SITE_NAME = "Aspect Ratio Calculator";

/** Shared SSR/client metadata from explicitly configured public site settings. */
export function previewSeoMeta(title: string, description: string, path: SitePath) {
  return [
    { title },
    { name: "description", content: description },
    { name: "author", content: MAINTAINER.name },
    { name: "robots", content: robotsDirective() },
    ...(canonicalUrl(path) ? [{ property: "og:url", content: canonicalUrl(path)! }] : []),
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
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

/** Only facts shown on the page; omit identity URLs until an origin is configured. */
export function seoScripts(title: string, description: string, path: SitePath, tool = true) {
  const url = canonicalUrl(path);
  const home = canonicalUrl("/");
  const graph = [
    { "@type": "WebSite", name: SITE_NAME, inLanguage: "en", sameAs: [REPOSITORY_URL], author: MAINTAINER, ...(home ? { "@id": `${home}#website`, url: home } : {}) },
    { "@type": tool ? "WebApplication" : "WebPage", name: title, description, inLanguage: "en", author: MAINTAINER, dateModified: CONTENT_UPDATED,
      ...(url ? { "@id": `${url}#${tool ? "app" : "page"}`, url } : {}),
      ...(home ? { isPartOf: { "@id": `${home}#website` } } : {}),
      ...(tool ? { applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript and a modern web browser" } : {}),
    },
  ];
  return [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }];
}
