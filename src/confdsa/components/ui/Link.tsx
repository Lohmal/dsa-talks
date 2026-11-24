"use client";

import NextLink from "next/link";
import { usePathname as useNextPathname } from "next/navigation";
import { conferencePaths } from "@/confdsa/config/paths";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// While an earlier year is shown (/2026/...), links to conference pages stay in that year:
// "/program" becomes "/2026/program". Other links (events, mailto, external) are unchanged.
export function withBase(base: string, href: string) {
  if (!base || !href.startsWith("/")) return href;
  if (href === "/") return base;
  return conferencePaths.includes(href.split(/[/?#]/)[1]) ? base + href : href;
}

export default function Link(props: React.ComponentProps<typeof NextLink>) {
  const { base } = useLanguage();
  return <NextLink {...props} href={typeof props.href === "string" ? withBase(base, props.href) : props.href} />;
}

// The path without the year prefix, so menus can compare it with "/program" and the like.
export function usePathname() {
  const { base } = useLanguage();
  const path = useNextPathname();
  if (!base) return path;
  return path === base ? "/" : path.startsWith(`${base}/`) ? path.slice(base.length) : path;
}
