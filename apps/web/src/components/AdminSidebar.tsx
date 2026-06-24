"use client";

import { usePathname, Link } from "@/routing";
import { useTranslations } from "next-intl";
import { 
  Activity,
  Users,
  Film,
  ScrollText,
  Wrench,
  Video,
  ArrowLeft
} from "lucide-react";
import UserDropdown from "./UserDropdown";

interface AdminSidebarProps {
  user?: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin/dashboard", label: t("adminDashboard"), icon: Activity },
    { href: "/admin/users", label: t("adminUsers"), icon: Users },
    { href: "/admin/content", label: t("adminContent"), icon: Film },
    { href: "/admin/logs", label: t("adminLogs"), icon: ScrollText },
    { href: "/admin/config", label: t("adminConfig"), icon: Wrench }
  ];

  return (
    <aside className="w-[280px] bg-[#1a1a1a] border-r border-white/10 flex flex-col h-full sticky top-0">
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            VidForge Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">Quản trị hệ thống</div>
        <ul className="space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ease-out active:scale-[0.97] ${
                    isActive 
                      ? "bg-red-500/20 text-red-400 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-red-400" : ""}`} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-white/10 shrink-0 bg-black/20">
        {user && <UserDropdown user={user} role="admin" mode="sidebar" />}
      </div>
    </aside>
  );
}
