import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
const TITLE = "Aspect Ratio Calculator — Image & Video Dimensions";
const DESC =
  "Calculate image and video aspect ratios from width and height, or calculate a missing dimension. Compare common ratios and scale dimensions in your browser.";

export const Route = createFileRoute("/")({
  component: Calculator,
  head: () => ({ scripts: seoScripts(TITLE, DESC, "/"),
    meta: previewSeoMeta(TITLE, DESC, "/"),
    links: seoLinks("/"),
  }),
});

