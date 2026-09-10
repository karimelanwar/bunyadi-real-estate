import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Logo priority className="h-12 shrink-0" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
