import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Certificate fonts and logos are read from disk at request time; make sure hosting
  // platforms that bundle each route separately (Vercel) ship them too.
  outputFileTracingIncludes: {
    "/**": ["./src/assets/**/*"],
  },
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
