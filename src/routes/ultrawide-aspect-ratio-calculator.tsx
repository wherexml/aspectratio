import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks } from "@/lib/seo";

const TITLE = "Ultrawide Aspect Ratio Calculator — True Pixel Ratios & 21:9";
const DESCRIPTION = "Scale 3440×1440, 2560×1080 and other ultrawide resolutions using their exact ratios. Compare actual pixel proportions with strict 21:9.";

export const Route = createFileRoute("/ultrawide-aspect-ratio-calculator")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator"), links: seoLinks("/ultrawide-aspect-ratio-calculator") }),
  component: () => <Calculator ultrawide />,
});
