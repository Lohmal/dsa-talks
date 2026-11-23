"use client";

import { useRouter } from "next/navigation";

// A table row that opens `href` when clicked anywhere. A link stretched over the row with
// CSS does not stay inside the row in Safari (every row covered the whole table and the
// last one won), so the row handles the click; the name inside stays a real link for the
// keyboard and screen readers.
export default function LinkRow({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      className={`cursor-pointer ${className}`}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button") || window.getSelection()?.toString()) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
