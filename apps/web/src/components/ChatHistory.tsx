"use client";

import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/routing";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

export default function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Chat");

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        setLoading(false);
      });
  }, [pathname]);

  const handleNewChat = () => {
    // Determine the base path based on current role
    const basePath = pathname?.startsWith("/admin") ? "/admin/generate" : "/dashboard/generate";
    router.push(basePath);
  };

  return (
    <div className="mt-4 flex flex-col h-1/2 overflow-hidden border-t border-white/10 pt-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {t("history")}
        </span>
        <button 
          onClick={handleNewChat}
          className="text-white/50 hover:text-white transition-colors p-1"
          title={t("newChat")}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center py-4 text-white/50">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-xs text-white/40 px-2 py-3 text-center">
            {t("noChats")}
          </div>
        ) : (
          sessions.map((session) => {
            const href = pathname?.startsWith('/admin') ? `/admin/generate/${session.id}` : `/dashboard/generate/${session.id}`;
            const isActive = pathname === href;
            
            return (
              <Link
                key={session.id}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ease-out active:scale-[0.97] group ${
                  isActive 
                    ? "bg-purple-500/20 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                    : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"
                }`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-purple-400" : ""}`} />
                <span className="truncate text-sm">{session.title}</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
