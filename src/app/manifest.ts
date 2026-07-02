import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Creator AI Suite",
    short_name: "Creator AI",
    description: "AI-powered content creation platform for creators",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#FF0033",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
