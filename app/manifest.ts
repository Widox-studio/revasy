import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Widox Review Assistant",
    short_name: "Widox Reviews",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Widox.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf0",
    theme_color: "#fffaf0",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
