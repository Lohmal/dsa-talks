"use client";

import Container from "@/confdsa/components/ui/Container";
import Button from "@/confdsa/components/ui/Button";
import SectionTitle from "@/confdsa/components/ui/SectionTitle";
import SpeakerGrid from "@/confdsa/components/sections/SpeakerGrid";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function SpeakersSection() {
  const { m } = useLanguage();

  return (
    <section className="py-16">
      <Container>
        <SectionTitle title={m.home.speakersTitle} subtitle={m.home.speakersText} />
        <div className="mt-12">
          <SpeakerGrid />
        </div>
        <div className="mt-10 text-center">
          <Button href="/speakers" variant="outline" className="rounded-lg bg-white">
            {m.home.speakersAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
