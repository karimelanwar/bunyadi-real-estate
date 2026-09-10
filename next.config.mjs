import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const securityHeaders = [
  // Uploaded property images are served as static files with a
  // browser-guessed content type; this stops a browser from ever
  // re-interpreting one as HTML/JS even if its declared MIME type
  // were wrong.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // The admin dashboard should never be embeddable in a frame
  // (clickjacking protection on the login form and property actions).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Ignored by browsers over plain HTTP, so this is a no-op on a local
  // HTTP deployment and only takes effect once served behind HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first, WebP second: Next picks per the browser's Accept header and
    // falls back to the original for anything that supports neither. AVIF is
    // typically 20-30% smaller than WebP on photographs, which is all this
    // site serves.
    formats: ["image/avif", "image/webp"],
    // How long an optimized variant stays fresh. The default is 60 seconds,
    // which makes the server re-encode the same image over and over. Property
    // photos come through /api/uploads/* which already sends its own
    // immutable one-year header (Next honours the longer upstream value), so
    // this mainly covers static images like the hero. 30 days rather than a
    // year because these URLs have no content hash: if you replace a file in
    // public/ with the same name, already-cached browsers keep the old one
    // until this expires. Give a replacement a new filename to bust it.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
