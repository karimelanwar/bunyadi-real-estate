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
