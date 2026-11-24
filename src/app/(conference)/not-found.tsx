import Link from "next/link";

// 404 for an address that is not a conference year (e.g. /abc); both languages at once,
// since no year's texts are loaded here.
export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-surface px-6 py-24 text-center">
      <div>
        <p className="text-6xl font-extrabold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-bold text-navy">Sayfa bulunamadı</h1>
        <p className="mt-1 text-lg text-navy/70">Page not found</p>
        <Link href="/" className="mt-8 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
          Ana sayfa · Home
        </Link>
      </div>
    </main>
  );
}
