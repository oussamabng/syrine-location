import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Syrine",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#111615",
    theme_color: "#111615",
    lang: "fr",
    icons: [
      { src: "/brand/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
