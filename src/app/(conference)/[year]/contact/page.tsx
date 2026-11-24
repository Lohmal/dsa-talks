import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ContactInfo from "@/confdsa/components/sections/ContactInfo";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Contact" };

export default async function Page({ params }: PageProps<"/[year]/contact">) {
  await requirePage((await params).year, "contact");
  return (
    <PageShell titleKey="contact">
      <ContactInfo />
    </PageShell>
  );
}
