import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pepply – en lugn minut för dig",
    short_name: "Pepply",
    description:
      "En personlig kvällsritual som hjälper dig avsluta dagen lite lugnare.",
    start_url: "/hem",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#f6b94b",
    orientation: "portrait-primary",
    categories: ["lifestyle", "health"],
    lang: "sv",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
