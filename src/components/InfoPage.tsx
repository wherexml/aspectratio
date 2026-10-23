import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/seo";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <Link to="/" className="text-sm font-semibold text-primary">{SITE_NAME}</Link>
    <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">{title}</h1>
    <div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground">{children}</div>
  </main>;
}
