import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Image Aspect Ratio Calculator — Photo Fit & Crop Preview";
const DESCRIPTION = "Choose a local image to find its dimensions and aspect ratio. Compare Fit and Fill previews in 1:1, 4:5, 9:16 and 16:9 frames.";

export const Route = createFileRoute("/image-aspect-ratio")({
  head: () => ({ scripts: seoScripts(TITLE, DESCRIPTION, "/image-aspect-ratio"), meta: previewSeoMeta(TITLE, DESCRIPTION, "/image-aspect-ratio"), links: seoLinks("/image-aspect-ratio") }),
  component: () => <Calculator key="image" media="image" />,
});
