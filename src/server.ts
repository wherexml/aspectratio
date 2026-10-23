import { SITE_PAGES, site, robotsDirective, robotsTxt, sitemapXml } from "./lib/site";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      // Only the explicitly published hosts redirect; local/preview stays local.
      const publishedHosts = ["imageaspectratio.com", "www.imageaspectratio.com", "aspect-ratio-canvas.geekmooc.workers.dev"];
      if (site.indexable && site.origin === "https://imageaspectratio.com" &&
          publishedHosts.includes(url.hostname) && url.origin !== site.origin) {
        return new Response(null, {
          status: 308,
          headers: { Location: `${site.origin}${url.pathname}${url.search}` },
        });
      }
      const isRead = request.method === "GET" || request.method === "HEAD";
      if (isRead && (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt")) {
        const sitemap = url.pathname === "/sitemap.xml";
        return new Response(request.method === "HEAD" ? null : sitemap ? sitemapXml() : robotsTxt(), {
          headers: {
            "Content-Type": sitemap ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8",
            "X-Robots-Tag": "noindex",
            "Cache-Control": "no-cache",
          },
        });
      }
      const cleanPath = url.pathname.replace(/\/+$/, "") || "/";
      if (isRead && cleanPath !== url.pathname && SITE_PAGES.some(path => path === cleanPath)) {
        return new Response(null, { status: 308, headers: { Location: cleanPath + url.search } });
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      if (!site.indexable && normalized.headers.get("content-type")?.includes("text/html")) {
        const headers = new Headers(normalized.headers);
        headers.set("X-Robots-Tag", robotsDirective());
        return new Response(normalized.body, {status: normalized.status, statusText: normalized.statusText, headers});
      }
      return normalized;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
