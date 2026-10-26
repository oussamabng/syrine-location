import type { MetadataRoute } from "next";
/** Private, unsolicited concept demo. Do not present this site in search results. */
export default function robots(): MetadataRoute.Robots {
 return {rules:[{userAgent:"*",disallow:"/"}]};
}
