import type { Metadata } from "next";
import Header from "@/components/Header";
import Committees from "@/components/Committees";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kurullar – Committees | DSATalks",
  description: "DSATalks onur kurulu, program kurulu ve düzenleme kurulu – Honorary, program and organizing committees.",
  alternates: { canonical: "/kurullar" },
};

export default function CommitteesPage() {
  return (
    <>
      <Header />
      <main>
        <Committees />
      </main>
      <Footer />
    </>
  );
}
