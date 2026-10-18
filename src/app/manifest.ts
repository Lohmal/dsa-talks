import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DSA Talks – Data Science and Analytics",
    short_name: "DSA Talks",
    description:
      "Two days of talks on data science, biostatistics, machine learning and AI. 4–5 November 2026, ATÜ Library Conference Hall, Adana.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d7182a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
