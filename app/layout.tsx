import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// This root layout is intentionally minimal: it only exists to satisfy
// Next.js's requirement that exactly one <html>/<body> pair be rendered by
// the outermost layout in the tree. The actual chrome lives in
// app/[locale]/layout.tsx. Having this root layout (plus app/not-found.tsx)
// is also what makes Next.js's App Router correctly render custom
// not-found.tsx boundaries at all — without it, notFound() calls silently
// fall back to Next's built-in default 404 page instead of our branded one.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
