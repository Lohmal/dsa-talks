import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Builds a self-contained server in .next/standalone for the Docker image (see Dockerfile).
  output: "standalone",
  // Certificate fonts and logos are read from disk at request time; ship them with the server.
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
