import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME } from "@/lib/seo";
const TITLE = "Terms — " + SITE_NAME;
const DESCRIPTION = "Usage and output limitations for Aspect Ratio Calculator.";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/terms"), links: seoLinks("/terms"), scripts: seoScripts(TITLE, DESCRIPTION, "/terms", false) }),
  component: () => <InfoPage title="Terms"><section><h2 className="text-lg font-semibold text-foreground">Using the tools</h2><p>Use the calculator to explore dimensions and frame proportions. Select only files you are entitled to use. No account or payment is required by this version of the calculator.</p></section>
<section><h2 className="text-lg font-semibold text-foreground">Checking results</h2><p>Check the dimensions and requirements of your destination before using a result. Rounded pixel sizes can differ slightly from an exact ratio. Video previews assume square pixels and do not inspect video metadata.</p><p>Fit and Fill are visual previews. The calculator does not modify, export or transcode your files, and a preview does not guarantee acceptance by another platform.</p></section></InfoPage>,
});
