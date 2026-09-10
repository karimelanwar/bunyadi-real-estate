import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Bunyadi Real Estate"
            width={288}
            height={66}
            priority
            className="h-9 w-auto shrink-0 object-contain"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
