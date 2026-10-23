import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME, REPOSITORY_URL } from "@/lib/seo";
const TITLE = "Contact — " + SITE_NAME;
const DESCRIPTION = "Report a calculator problem or suggest an improvement through the public GitHub issue tracker.";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/contact"), links: seoLinks("/contact"), scripts: seoScripts(TITLE, DESCRIPTION, "/contact", false) }),
  component: () => <InfoPage title="Contact"><p>Report a problem or suggest an improvement in our <a className="underline" href={`${REPOSITORY_URL}/issues`}>GitHub issue tracker</a>.</p><p>For calculation problems, include the page, input dimensions, expected result and actual result. Issues are public; do not include private images or personal information. A GitHub account is required to submit an issue.</p></InfoPage>,
});
