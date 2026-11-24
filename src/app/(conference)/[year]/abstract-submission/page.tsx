import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import AbstractSubmission from "@/confdsa/components/sections/AbstractSubmission";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Abstract Submission" };

export default async function Page({ params }: PageProps<"/[year]/abstract-submission">) {
  await requirePage((await params).year, "abstractSubmission");
  return (
    <PageShell titleKey="abstractSubmission">
      <AbstractSubmission />
    </PageShell>
  );
}
