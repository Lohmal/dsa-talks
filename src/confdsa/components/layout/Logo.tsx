import Image from "next/image";
import Link from "@/confdsa/components/ui/Link";

// Official ConfDSA badge (public/brand) with the wordmark beside it.
export default function Logo({ light = false, size = 44 }: { light?: boolean; size?: number }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap" aria-label="CONFDSA – Home">
      {/* unoptimized: plain static file, so the site also works as a static export */}
      <Image
        src="/brand/logo-192.png"
        alt=""
        width={size}
        height={size}
        unoptimized
        priority
        className={light ? "rounded-full ring-2 ring-white/15" : ""}
      />
      <span className={`text-lg tracking-tight ${light ? "text-white" : "text-navy"}`}>
        <span className="font-extrabold uppercase">
          Conf<span className="text-red-600">DSA</span> 2026
        </span>
      </span>
    </Link>
  );
}