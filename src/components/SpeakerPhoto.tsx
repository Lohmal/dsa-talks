import Image from "next/image";
import type { Speaker } from "@/data/speakers";

// A speaker photo filling its round frame (the parent sets size, rounding and overflow).
// Square photos simply cover the frame. A portrait photo with a `frame` is shown smaller
// than the frame instead of being cropped tight: its edges fade into a backdrop that
// continues the photo's own wall, so the file itself stays the untouched original.
export default function SpeakerPhoto({ speaker, alt = "", sizes }: { speaker: Speaker; alt?: string; sizes: string }) {
  const { frame } = speaker;

  if (!frame) {
    return <Image src={speaker.photo} alt={alt} fill sizes={sizes} unoptimized className="object-cover" />;
  }

  const fade = "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)";
  return (
    <span className="absolute inset-0" style={{ background: frame.backdrop }}>
      <Image
        src={speaker.photo}
        alt={alt}
        width={frame.photoWidth}
        height={frame.photoHeight}
        sizes={sizes}
        unoptimized
        className="absolute h-auto max-w-none"
        style={{
          width: `${frame.width}%`,
          left: `${frame.left}%`,
          top: `${frame.top}%`,
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />
    </span>
  );
}
