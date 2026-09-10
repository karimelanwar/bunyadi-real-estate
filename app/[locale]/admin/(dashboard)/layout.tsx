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
    <div className="flex min-h-screen flex-col bg-sand-50 lg:flex-row">
      <AdminSidebar />
      {/* min-w-0 so this column can shrink below the intrinsic width of the
          wide admin tables once the sidebar is beside it (lg:flex-row) —
          a flex item otherwise refuses to go below its content's min-content
          width and pushes the row wider than the viewport. */}
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
    </div>
  );
}
