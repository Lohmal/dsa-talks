import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { siteUrl } from "@/config/url";
import "./globals.css";

// Root of the CONFDSA site (/, /program, /2026/...). The menu, footer and texts of the shown
// year come from [year]/layout.tsx.

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CONFDSA – International Conference on Data Science and Analytics",
    template: "%s | CONFDSA",
  },
  description:
    "An academic conference on data science, analytics, and AI at Adana Alparslan Türkeş Science and Technology University.",
};

export default function ConferenceRootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
