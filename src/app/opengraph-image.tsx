import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Link preview for WhatsApp, LinkedIn, X…: the poster's red band in 1200×630.

export const alt = "DSATalks – Data Science and Analytics · 4–5 November 2026 · ATÜ Library Conference Hall, Adana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "src/assets/fonts");

export default async function Image() {
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
            <span>DSA</span>
            <span style={{ color: "#13224b" }}>Talks</span>
          </div>
          <div style={{ width: 170, height: 12, borderRadius: 6, background: "#13224b", marginTop: 34 }} />
          <div style={{ display: "flex", alignItems: "center", fontSize: 50, fontWeight: 700, marginTop: 30 }}>
            Where data turns into
            <span
              style={{
                marginLeft: 16,
                padding: "0 18px 6px",
                borderRadius: 18,
                background: "#13224b",
              }}
            >
              decisions.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, fontSize: 28, fontWeight: 500 }}>
          <span>4–5 November 2026</span>
          <span style={{ opacity: 0.85 }}>ATÜ Library Conference Hall · Adana</span>
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
