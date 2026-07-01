"use client";

import { useState } from "react";
import { usePathname, Link } from "@/routing";
import { useTranslations } from "next-intl";
import { 
  Activity,
  Users,
  Film,
  ScrollText,
  Wrench,
  Video,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import UserDropdown from "./UserDropdown";

interface AdminSidebarProps {
  user?: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const adminLinks = [
    { href: "/admin/dashboard", label: t("adminDashboard"), icon: Activity },
    { href: "/admin/users", label: t("adminUsers"), icon: Users },
    { href: "/admin/content", label: t("adminContent"), icon: Film },
    { href: "/admin/logs", label: t("adminLogs"), icon: ScrollText },
    { href: "/admin/config", label: t("adminConfig"), icon: Wrench }
  ];

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            VidForge Admin
          </span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`${isCollapsed ? "md:w-[80px]" : "md:w-[280px]"} w-[280px] bg-[#1a1a1a] border-r border-white/10 flex flex-col h-[100dvh] md:h-screen fixed md:relative top-0 left-0 z-[100] md:z-auto transition-all duration-300 ease-in-out shrink-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-4 top-8 z-[100] w-8 h-8 items-center justify-center bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg shadow-black/50 transition-transform hover:scale-110"
          title="Thu gọn/Phóng to Sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Mobile Close Button */}
        <div className="md:hidden absolute -right-12 top-4">
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] border border-white/10 rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-6 pb-2 ${isCollapsed ? "md:px-4" : ""}`}>
          <Link href="/" className={`flex items-center gap-2 mb-6 ${isCollapsed ? "md:justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 whitespace-nowrap">
                VidForge Admin
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 whitespace-nowrap">
              Quản trị hệ thống
            </div>
          )}
          <ul className="space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ease-out active:scale-[0.97] ${
                      isActive 
                        ? "bg-red-500/20 text-red-400 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                        : `text-white/60 hover:bg-white/5 hover:text-white ${!isCollapsed ? "hover:translate-x-1" : ""}`
                    } ${isCollapsed ? "md:justify-center" : ""}`}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-red-400" : ""}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={`p-4 border-t border-white/10 shrink-0 bg-black/20 ${isCollapsed ? "md:flex md:justify-center md:px-2" : ""}`}>
          {user && <UserDropdown user={user} role="admin" mode={(!isCollapsed || isMobileOpen) ? "sidebar" : "icon-only"} />}
        </div>
      </aside>
    </>
  );
}
