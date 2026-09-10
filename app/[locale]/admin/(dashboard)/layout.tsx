import { redirect } from "@/i18n/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sand-50 lg:flex-row">
      <AdminSidebar />
      {/* min-w-0 is load-bearing: without it, a flex item can't shrink below
          its content's intrinsic width, so the wide tables on the
          Properties/Inquiries pages (min-w-[1000px]/[840px]) push this whole
          column wider than the viewport instead of scrolling inside their
          own overflow-x-auto wrapper — the symptom is stray horizontal
          scroll / blank space on mobile. */}
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
    </div>
  );
}
