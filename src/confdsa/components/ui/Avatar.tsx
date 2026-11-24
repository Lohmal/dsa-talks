import Image from "next/image";

// Person photo when one is available, otherwise initials on navy.
export default function Avatar({
  photo,
  initials,
  alt,
  className = "",
  textClassName = "text-sm",
  sizes = 96,
}: {
  photo?: string;
  initials: string;
  alt: string;
  className?: string;
  textClassName?: string;
  sizes?: number;
}) {
  if (photo) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full bg-navy ${className}`}>
        <Image src={photo} alt={alt} width={sizes} height={sizes} unoptimized className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-navy font-bold text-white ${className} ${textClassName}`}
    >
      {initials}
    </span>
  );
}
