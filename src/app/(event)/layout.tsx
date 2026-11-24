import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { site } from "@/config/site";
import { siteUrl } from "@/config/url";
import "./globals.css";

// Poppins is the typeface of the poster.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const title = "DSATalks – Data Science and Analytics";
const description =
  "Two days of talks on data science, biostatistics, machine learning and AI. 4–5 November 2026, ATÜ Library Conference Hall, Adana.";

// Root of the event template pages (/etkinlikler/<event>, the survey, the certificate check,
// the KVKK notice) and the admin panel. Each page brings its event texts (EventFrame).
// Icons (icon.svg, apple-icon.png) are file conventions in this folder.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "DSATalks",
  keywords: [
    "DSATalks",
    "DSA Talks",
    "data science",
    "data analytics",
    "biostatistics",
    "machine learning",
    "artificial intelligence",
    "MATLAB",
    "veri bilimi",
    "veri analitiği",
    "yapay zekâ",
    "ATÜ",
    "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi",
    "Adana",
  ],
  authors: [{ name: "ATÜ Veri Bilimi ve Analitiği Bölümü", url: site.departmentUrl }],
  openGraph: {
    type: "website",
    siteName: "DSATalks",
    title,
    description,
    locale: "en_US",
    alternateLocale: ["tr_TR"],
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#d7182a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} antialiased`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
