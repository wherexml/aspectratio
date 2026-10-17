import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks } from "@/lib/seo";

const TITLE = "Video Aspect Ratio Calculator — Screen Fit Simulator";
const DESCRIPTION = "Enter video dimensions to calculate the exact aspect ratio. Compare Fit and Fill on a widescreen display and a vertical phone, then scale the dimensions.";

export const Route = createFileRoute("/video-aspect-ratio")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/video-aspect-ratio"), links: seoLinks("/video-aspect-ratio") }),
  component: () => <Calculator key="video" media="video" />,
});
