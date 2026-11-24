import { LanguageProvider } from "@/i18n/LanguageProvider";
import CookieBanner from "@/components/CookieBanner";
import type { EventContent } from "@/content/event";

// Texts and details of one event year for every page of the event template (event page,
// committees, survey, certificate check, KVKK notice), plus the cookie choice.
export default function EventFrame({
  content,
  base,
  children,
}: {
  content: EventContent;
  base: string;
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider content={content} base={base}>
      {children}
      <CookieBanner />
    </LanguageProvider>
  );
}
