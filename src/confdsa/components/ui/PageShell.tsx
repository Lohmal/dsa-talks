import Container from "./Container";
import PageHeader from "./PageHeader";
import type { NavKey } from "@/confdsa/config/navigation";

// Common layout for inner pages: banner + content area.
export default function PageShell({
  titleKey,
  parent,
  title,
  children,
}: {
  titleKey: NavKey;
  parent?: { key: NavKey; href: string };
  title?: { en: string; tr: string };
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader titleKey={titleKey} parent={parent} title={title} />
      <div className="bg-surface">
        <Container className="py-12 sm:py-16">{children}</Container>
      </div>
    </>
  );
}
