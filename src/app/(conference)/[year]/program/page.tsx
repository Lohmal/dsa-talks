import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ProgramTable from "@/confdsa/components/sections/ProgramTable";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Program" };

export default async function Page({ params }: PageProps<"/[year]/program">) {
  await requirePage((await params).year, "conferenceProgram");
  return (
    <PageShell titleKey="conferenceProgram">
      <ProgramTable />
    </PageShell>
  );
}
