import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sierra Elvira - Club de Voleibol",
    short_name: "Sierra Elvira",
    description: "Sistema de gestión para el Club de Voleibol Sierra Elvira",
    start_url: "/",
    display: "standalone",
    background_color: "#121414",
    theme_color: "#ff7a21",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
