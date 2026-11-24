"use client";

import Container from "@/confdsa/components/ui/Container";
import Button from "@/confdsa/components/ui/Button";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import SectionTitle from "@/confdsa/components/ui/SectionTitle";
import ProgramTable from "@/confdsa/components/sections/ProgramTable";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Full program, stacked day by day like the poster.
export default function ProgramSection() {
  const { m } = useLanguage();

  return (
    <section className="py-16">
      <Container>
        <SectionTitle title={m.home.programTitle} />
        <FadeIn className="mt-12">
          <ProgramTable dayHeading="h3" />
        </FadeIn>
        <div className="mt-10 text-center">
          <Button href="/program" className="rounded-lg">
            {m.home.ctaProgram}
          </Button>
        </div>
      </Container>
    </section>
  );
}
