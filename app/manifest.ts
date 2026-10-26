import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Chawki Auto",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#161B23",
    theme_color: "#161B23",
    lang: "fr",
    icons: [
      { src: "/brand/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
