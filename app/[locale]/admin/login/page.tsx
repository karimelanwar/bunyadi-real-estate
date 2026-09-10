import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG doesn't need next/image's raster optimization */}
          <img
            src="/logo.svg"
            alt="Bunyadi Real Estate"
            width={576}
            height={100}
            className="h-12 w-auto shrink-0 object-contain"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
