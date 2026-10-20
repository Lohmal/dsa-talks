import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Certificate fonts and logos are read from disk at request time; make sure hosting
  // platforms that bundle each route separately (Vercel) ship them too.
  outputFileTracingIncludes: {
    "/**": ["./src/assets/**/*"],
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
