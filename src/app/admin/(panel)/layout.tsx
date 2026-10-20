import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Yönetim | DSATalks", template: "%s | DSATalks Yönetim" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();

  return (
    <div className="min-h-svh bg-surface lg:grid lg:grid-cols-[17rem_1fr]">
      <AdminNav user={user} />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
