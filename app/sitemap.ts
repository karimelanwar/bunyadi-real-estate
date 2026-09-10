import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/residential", "/commercial", "/business"].map((path) => ({
    url: `${siteUrl}/en${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    // Sold/let-agreed listings stay indexed — they keep working URLs.
    const properties = await prisma.property.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    return [
      ...staticRoutes,
      ...properties.map((property) => ({
        url: `${siteUrl}/en/properties/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // A sitemap request must never take the site down if the DB is unreachable.
    return staticRoutes;
  }
}
