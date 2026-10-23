import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME, REPOSITORY_URL, MAINTAINER } from "@/lib/seo";
const TITLE = "About — " + SITE_NAME;
const DESCRIPTION = "About the image, video and ultrawide aspect ratio tools.";
export const Route = createFileRoute("/about")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/about"), links: seoLinks("/about"), scripts: seoScripts(TITLE, DESCRIPTION, "/about", false) }),
  component: () => <InfoPage title="About"><p>Aspect Ratio Calculator helps you calculate image and video proportions, find a missing dimension, and scale pixel dimensions.</p>
<section><h2 className="text-lg font-semibold text-foreground">Tools and limits</h2><p>The image tool reads a local image’s dimensions and previews Fit and Fill in common frames. The video tool uses dimensions you enter to simulate widescreen and vertical frames. The ultrawide tool distinguishes exact pixel ratios from strict 21:9.</p><p>These tools calculate dimensions and show previews. They do not export resized images, crop files or transcode video.</p></section>
<section><h2 className="text-lg font-semibold text-foreground">Calculation method</h2><p>Aspect ratio expresses width relative to height. For whole-pixel dimensions, divide width and height by their greatest common divisor. For example, 1920 ÷ 120 = 16 and 1080 ÷ 120 = 9, giving 16:9.</p><p>For a target ratio W:H, height = width × H ÷ W. Decimal inputs use exact fraction calculations. Rounded pixel results and approximate preview labels are identified separately.</p></section><section><h2 className="text-lg font-semibold text-foreground">Maintenance and source</h2><p>Maintained by <a className="underline" href={MAINTAINER.url}>{MAINTAINER.name}</a>. The <a className="underline" href={REPOSITORY_URL}>source code</a> is available under the MIT license.</p></section></InfoPage>,
});
