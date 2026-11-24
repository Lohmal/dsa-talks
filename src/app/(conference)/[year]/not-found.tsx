"use client";

import Container from "@/confdsa/components/ui/Container";
import Button from "@/confdsa/components/ui/Button";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function NotFound() {
  const { m } = useLanguage();

  return (
    <Container className="py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy">{m.common.notFoundTitle}</h1>
      <p className="mt-2 text-muted">{m.common.notFoundText}</p>
      <Button href="/" className="mt-8">
        {m.common.backHome}
      </Button>
    </Container>
  );
}
