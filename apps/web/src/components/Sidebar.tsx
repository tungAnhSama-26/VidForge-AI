"use client";

import { usePathname, Link } from "@/routing";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  FolderGit2,
  Sparkles,
  Clapperboard,
  MessageSquare,
  Scissors,
  Settings,
  Users,
  Film,
  Wrench,
  LogOut,
  Video,
  Activity,
  ScrollText,
  User,
  Home
} from "lucide-react";
import UserDropdown from "./UserDropdown";
import ChatHistory from "./ChatHistory";

interface SidebarProps {
  role?: string;
  user?: any;
}

export default function Sidebar({ role, user }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const isAdminPath = pathname?.startsWith("/admin") || false;
  const allLinks = [];
  const isAdminRole = role === "admin" || role === "owner";
  
  if (isAdminPath && isAdminRole) {
    allLinks.push(
      { href: "/admin/dashboard", label: t("adminDashboard"), icon: Activity },
      { href: "/admin/users", label: t("adminUsers"), icon: Users },
      { href: "/admin/content", label: t("adminContent"), icon: Film },
      { href: "/admin/logs", label: t("adminLogs"), icon: ScrollText },
      { href: "/admin/config", label: t("adminConfig"), icon: Wrench }
    );
  } else {
    allLinks.push(
      { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
      { href: "/dashboard/projects", label: t("projects"), icon: FolderGit2 },
      { href: "/dashboard/generate", label: t("generate"), icon: Sparkles },
      { href: "/dashboard/library", label: t("library"), icon: Clapperboard },
      { href: "/dashboard/prompts", label: t("prompts"), icon: MessageSquare },
      { href: "/dashboard/settings", label: t("settings"), icon: Settings }
    );
  }

  return (
    <aside className="w-[280px] bg-[#0a0a0a] border-r border-white/10 flex flex-col h-full sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            VidForge AI
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col">
        <ul className="space-y-1">
          {allLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/dashboard" || link.href === "/admin/dashboard"
              ? pathname === link.href 
              : pathname?.startsWith(link.href);
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ease-out active:scale-[0.97] ${
                    isActive 
                      ? "bg-purple-500/20 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Chat History Section */}
        {!isAdminPath && <ChatHistory />}
      </div>

      <div className="p-4 border-t border-white/10 shrink-0">
        {user && <UserDropdown user={user} role={role} mode="sidebar" />}
      </div>
    </aside>
  );
}
