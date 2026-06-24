import { auth } from "@/auth";
import SidebarSwitcher from "@/components/SidebarSwitcher";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();

  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect('/login');
  }

  // Use the extended session user role
  const role = (session?.user as any)?.role || "user";

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <SidebarSwitcher role={role} user={session!.user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
