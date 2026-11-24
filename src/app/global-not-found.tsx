import type { Metadata } from "next";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import "./(conference)/globals.css";

// 404 for addresses that match no page (the site has two root layouts, so this one stands on
// its own). Both languages at once: no texts are loaded here.

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = { title: "Sayfa bulunamadı – Page not found | CONFDSA" };

export default function GlobalNotFound() {
  return (
    <html lang="tr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="grid min-h-full place-items-center bg-surface px-6 py-24 text-center font-sans">
        <div>
          <p className="text-6xl font-extrabold text-brand">404</p>
          <h1 className="mt-4 text-2xl font-bold text-navy">Sayfa bulunamadı</h1>
          <p className="mt-1 text-lg text-navy/70">Page not found</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Ana sayfa · Home
          </Link>
        </div>
      </body>
    </html>
  );
}
