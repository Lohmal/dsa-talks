import type { NavItem } from "@/confdsa/config/navigation";

// A menu item is active on its own page, its sub-pages, or any of its children's pages.
export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname.startsWith(item.href) || (item.children ?? []).some((child) => isActive(pathname, child));
}
