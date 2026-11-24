// Classic congress-style section title: centered heading with a short red rule.
export default function SectionTitle({
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  const centered = align === "center";

  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className={`text-3xl font-semibold tracking-tight sm:text-4xl ${light ? "text-white" : "text-navy"}`}>{title}</h2>
      <span aria-hidden className={`mt-3 block h-1 w-14 rounded-full bg-brand ${centered ? "mx-auto" : ""}`} />
      {subtitle && <p className={`mt-4 ${light ? "text-white/70" : "text-muted"}`}>{subtitle}</p>}
    </div>
  );
}
