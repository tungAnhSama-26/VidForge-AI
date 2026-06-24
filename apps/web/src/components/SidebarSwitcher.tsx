"use client";

import { usePathname } from "@/routing";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";

interface SidebarSwitcherProps {
  role: string;
  user: any;
}

export default function SidebarSwitcher({ role, user }: SidebarSwitcherProps) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  if (isAdminPath && (role === "admin" || role === "owner")) {
    return <AdminSidebar user={user} />;
  }

  return <Sidebar role={role} user={user} />;
}
