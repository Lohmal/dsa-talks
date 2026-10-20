import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Yönetim Girişi | DSATalks",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const session = await auth();
  if (session?.user?.id && (await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } }))) {
    redirect("/admin");
  }
  const { next } = await searchParams;

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-5 py-16">
      <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-brand sm:w-3" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[22px_22px]"
      />
      <svg aria-hidden viewBox="0 0 600 600" className="absolute -right-56 -top-56 size-[44rem]">
        {[140, 220, 300].map((r) => (
          <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity="0.07" />
        ))}
      </svg>
      <div className="relative w-full max-w-md">
        <p className="text-center text-4xl font-black tracking-[-0.04em]">
          <span className="text-white">DSA</span>
          <span className="text-brand">Talks</span>
        </p>
        <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.35em] text-white/60">Yönetim Paneli</p>
        <LoginForm next={typeof next === "string" ? next : ""} />
      </div>
    </div>
  );
}
