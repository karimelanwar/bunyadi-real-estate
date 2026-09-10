// Absolute base URL used for canonical links, Open Graph images and the
// sitemap. Set NEXT_PUBLIC_SITE_URL in production; the localhost fallback only
// affects local development.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
