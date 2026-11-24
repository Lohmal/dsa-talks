import Link from "@/confdsa/components/ui/Link";

type Variant = "primary" | "outline" | "light";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-navy/20 text-navy hover:border-navy hover:bg-navy hover:text-white",
  light: "bg-white text-navy hover:bg-surface",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  download?: boolean;
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  external = false,
  download = false,
  className = "",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (external || download || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        download={download || undefined}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function DisabledButton({ children }: { children: React.ReactNode }) {
  return (
    <span aria-disabled="true" className={`${base} cursor-not-allowed bg-line text-muted`}>
      {children}
    </span>
  );
}
