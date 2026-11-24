import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { adminEdition, editionPath, listEvents, surveyPath } from "@/lib/editions";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Yönetim | CONFDSA", template: "%s | CONFDSA Yönetim" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const [edition, events] = await Promise.all([adminEdition(), listEvents()]);
  const editions = events.flatMap((event) =>
    event.editions.map((e) => ({ id: e.id, label: `${event.name} ${e.year}${e.year === event.currentYear ? " (güncel)" : ""}` })),
  );

  return (
    <div className="min-h-svh bg-surface lg:grid lg:grid-cols-[17rem_1fr]">
      <AdminNav
        user={user}
        editions={editions}
        current={{
          id: edition.id,
          label: `${edition.event.name} ${edition.year}`,
          siteHref: editionPath(edition),
          surveyHref: surveyPath(edition),
        }}
      />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
