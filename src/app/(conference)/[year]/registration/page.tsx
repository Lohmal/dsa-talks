import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ComingSoon from "@/confdsa/components/ui/ComingSoon";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Registration" };

export default async function Page({ params }: PageProps<"/[year]/registration">) {
  await requirePage((await params).year, "registration");

  return (
    <PageShell titleKey="registration">
      <ComingSoon />
    </PageShell>
  );
}
