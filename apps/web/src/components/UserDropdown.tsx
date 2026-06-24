"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Home, LayoutDashboard, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/routing";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface UserDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  role?: string;
  mode: "header" | "sidebar" | "icon-only";
}

export default function UserDropdown({ user, role, mode }: UserDropdownProps) {
  const [isOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin") || false;
  const isAdminUser = role === "admin" || user?.role === "admin";
  
  const tNav = useTranslations("HomePage.nav");
  const tSidebar = useTranslations("Sidebar");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {mode === "header" ? (
        <button 
          onClick={() => setIsDropdownOpen(!isOpen)}
          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors group border border-white/10"
        >
          {user?.image ? (
            <Image src={user.image} alt={user?.name || "User"} width={24} height={24} className="rounded-full" />
          ) : (
            <UserIcon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          )}
          <span className="text-[11px] sm:text-xs font-medium text-white/80 hidden md:block group-hover:text-white transition-colors whitespace-nowrap tracking-tight">
            {user?.name || "User"}
          </span>
        </button>
      ) : mode === "icon-only" ? (
        <button 
          onClick={() => setIsDropdownOpen(!isOpen)}
          className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center justify-center transition-colors"
          title={user?.name || "User"}
        >
          {user?.image ? (
            <Image src={user.image} alt={user?.name || "User"} width={32} height={32} className="rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ) : (
        <button 
          onClick={() => setIsDropdownOpen(!isOpen)}
          className="w-full bg-white/5 hover:bg-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            {user?.image ? (
              <Image src={user.image} alt={user?.name || "User"} width={32} height={32} className="rounded-full flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[11px] sm:text-[12px] font-medium text-white whitespace-nowrap tracking-tight">
                {user?.name || "User"}
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute z-50 w-64 md:w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in ${
            mode === "header" ? "right-0 top-full mt-2" : "left-0 bottom-full mb-2"
          }`}
        >
          {mode === "header" && (
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <p className="text-sm font-medium text-white whitespace-nowrap tracking-tight">{user?.name || "User"}</p>
            </div>
          )}
          
          <div className="py-1">
            {mode === "sidebar" && (
              <Link 
                href="/"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Home className="w-4 h-4" />
                {tNav("home")}
              </Link>
            )}
            {isAdminUser && !isAdminPath && (
              <Link 
                href="/admin/dashboard"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>{tNav("switchToAdmin")}</span>
              </Link>
            )}
          </div>
          
          <div className="border-t border-white/5 py-1">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              {tSidebar("logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
