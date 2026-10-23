import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME } from "@/lib/seo";
const TITLE = "Privacy — " + SITE_NAME;
const DESCRIPTION = "How this calculator handles images, dimensions, theme preferences and network requests.";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/privacy"), links: seoLinks("/privacy"), scripts: seoScripts(TITLE, DESCRIPTION, "/privacy", false) }),
  component: () => <InfoPage title="Privacy"><section><h2 className="text-lg font-semibold text-foreground">Images and dimensions</h2><p>Images selected in the image tool are read through local browser object URLs. The calculator does not upload these images to an image-processing server. Entered dimensions are used in the page’s calculator state; the tool has no account or saved-project service.</p></section>
<section><h2 className="text-lg font-semibold text-foreground">Browser storage</h2><p>Your theme choice is stored in local storage under arc-theme. Clearing this site’s browser storage removes that preference.</p></section>
<section><h2 className="text-lg font-semibold text-foreground">Network requests</h2><p>Loading the website requests its pages and assets from its host. Fonts are requested from Google Fonts. These providers receive normal connection information such as your IP address and browser request headers.</p><p>When the site runs inside a Lovable editor preview with reporting hooks enabled, runtime error details may be sent through those hooks. This page does not promise that hosting or third-party providers keep no logs.</p></section></InfoPage>,
});
