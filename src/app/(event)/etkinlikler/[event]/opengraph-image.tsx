import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { localize } from "@/lib/bilingual";
import { loadEventYear } from "@/lib/eventPages";
import type { Messages } from "@/i18n/LanguageProvider";

// Link preview for WhatsApp, LinkedIn, X…: the poster's red band in 1200×630, with the name,
// slogan, date and venue of the event's current year.

export const alt = "Event of the Department of Data Science and Analytics, ATÜ, Adana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "src/assets/fonts");

export default async function Image({ params }: { params: Promise<{ event: string }> }) {
  const { content } = await loadEventYear((await params).event);
  const m = localize<Messages>(content.messages, "en");
  const name = m.meta.name;
  // Two colours as on the poster: "DSA" + "Talks", otherwise the first word + the rest.
  const space = name.indexOf(" ");
  const [head, tail] = name.startsWith("DSA") ? ["DSA", name.slice(3)] : space < 0 ? [name, ""] : [name.slice(0, space), name.slice(space)];
  const [black, bold, medium] = await Promise.all(
    ["Poppins-Black.ttf", "Poppins-Bold.ttf", "Poppins-Medium.ttf"].map((file) => readFile(join(fonts, file))),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "white",
          fontFamily: "Poppins",
          background: "linear-gradient(115deg, #e41f35 0%, #d7182a 45%, #ab1022 100%)",
          position: "relative",
        }}
      >
        {/* Rings, as on the poster */}
        {[180, 290, 400].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 1010 - r,
              top: 260 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              border: "2px solid rgba(255,255,255,0.13)",
            }}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, fontWeight: 700, letterSpacing: 6 }}>
          <div style={{ width: 48, height: 4, background: "white" }} />
          DATA SCIENCE AND ANALYTICS
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 190, fontWeight: 900, lineHeight: 0.9, letterSpacing: -10 }}>
            <span>{head}</span>
            <span style={{ color: "#13224b", whiteSpace: "pre" }}>{tail}</span>
          </div>
          <div style={{ width: 170, height: 12, borderRadius: 6, background: "#13224b", marginTop: 34 }} />
          <div style={{ display: "flex", alignItems: "center", fontSize: 50, fontWeight: 700, marginTop: 30 }}>
            {`${m.hero.line1} ${m.hero.line2}`}
            <span
              style={{
                marginLeft: 16,
                padding: "0 18px 6px",
                borderRadius: 18,
                background: "#13224b",
              }}
            >
              {m.hero.highlight}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, fontSize: 28, fontWeight: 500 }}>
          <span>{m.meta.dateRange}</span>
          <span style={{ opacity: 0.85 }}>{m.meta.address}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: black, weight: 900, style: "normal" },
        { name: "Poppins", data: bold, weight: 700, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
