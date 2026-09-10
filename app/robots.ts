import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel and API surface should never be indexed.
      disallow: ["/en/admin", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
