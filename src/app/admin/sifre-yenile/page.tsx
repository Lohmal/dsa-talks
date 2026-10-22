import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import AuthShell from "@/components/admin/AuthShell";
import { resetLinkOwner } from "@/lib/passwordReset";
import NewPasswordForm from "./NewPasswordForm";

export const metadata: Metadata = {
  title: "Yeni şifre | DSATalks",
  robots: { index: false, follow: false },
};

// Opened from the e-mailed link: /admin/sifre-yenile?token=…
export default async function NewPasswordPage({ searchParams }: PageProps<"/admin/sifre-yenile">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  const owner = await resetLinkOwner(value);

  return (
    <AuthShell>
      {owner ? (
        <NewPasswordForm token={value} email={owner.email} />
      ) : (
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
            <LinkIcon className="size-6" />
          </span>
          <h1 className="mt-5 text-xl font-extrabold text-ink">Bağlantı geçersiz</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bu bağlantının süresi dolmuş, daha önce kullanılmış ya da hatalı kopyalanmış olabilir.
          </p>
          <Link
            href="/admin/sifremi-unuttum"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Yeni bağlantı iste
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
