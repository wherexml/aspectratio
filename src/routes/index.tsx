import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks } from "@/lib/seo";
const TITLE = "Aspect Ratio Calculator — Calculate Width, Height & Ratio";
const DESC =
  "Find a missing width or height from any aspect ratio, or reduce pixel dimensions to an exact simplified ratio. Free, instant, works in your browser.";

export const Route = createFileRoute("/")({
  component: Calculator,
  head: () => ({
    meta: previewSeoMeta(TITLE, DESC, "/"),
    links: seoLinks("/"),
  }),
});

