import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CONFDSA – International Conference on Data Science and Analytics",
    short_name: "CONFDSA",
    description: "Conference and events of the Department of Data Science and Analytics, ATÜ, Adana.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d7182a",
    icons: [
      { src: "/brand/logo-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
