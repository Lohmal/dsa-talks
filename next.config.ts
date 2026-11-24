import type { NextConfig } from "next";
import { conferencePaths } from "./src/confdsa/config/paths";

const nextConfig: NextConfig = {
  // The CONFDSA pages live in app/(conference)/[year]; their usual addresses show the current
  // year ("/program" → "/current/program"), "/2026/program" an earlier one. The events page
  // takes the current year's menu and footer.
  rewrites() {
    return [
      { source: "/", destination: "/current" },
      { source: `/:page(${conferencePaths.join("|")})/:rest*`, destination: "/current/:page/:rest*" },
      { source: "/etkinlikler", destination: "/current/etkinlikler" },
      // The survey of a conference year uses the survey design of the event template.
      { source: "/:year(\\d{4})/anket", destination: "/konferans-anketi/:year" },
    ];
  },
  // Two root layouts (CONFDSA and the event template), so unknown addresses get one 404 page.
  experimental: { globalNotFound: true },
  // Certificate fonts and logos are read from disk at request time; make sure hosting
  // platforms that bundle each route separately (Vercel) ship them too.
  outputFileTracingIncludes: {
    "/**": ["./src/assets/**/*"],
  },
  // Loaded with Node's require instead of being bundled: its zip library (unzipper) has an
  // optional, lazily required S3 integration that the bundler would otherwise try to resolve.
  serverExternalPackages: ["exceljs"],
  poweredByHeader: false,
  // Security headers on every response: no framing by other sites (clickjacking), no MIME
  // sniffing, only the origin as referrer to other sites, no camera/microphone/location.
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
