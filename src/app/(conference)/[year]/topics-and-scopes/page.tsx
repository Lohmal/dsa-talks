import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import TopicsIntro from "@/confdsa/components/sections/TopicsIntro";
import TopicsGrid from "@/confdsa/components/sections/TopicsGrid";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Topics and Scopes" };

export default async function Page({ params }: PageProps<"/[year]/topics-and-scopes">) {
  await requirePage((await params).year, "conferenceTopics");
  return (
    <PageShell titleKey="conferenceTopics">
      <TopicsIntro />
      <div className="mt-10">
        <TopicsGrid />
      </div>
    </PageShell>
  );
}
