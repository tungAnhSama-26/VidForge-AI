"use client";

import { useEffect, useState } from "react";
import { Link, useRouter, usePathname } from "@/routing";
import { MessageSquare, Plus, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

export default function ChatSidebar({ currentSessionId }: { currentSessionId?: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

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
  }, [currentSessionId]);

  const groupSessions = () => {
    const groups: { [key: string]: ChatSession[] } = {
      "Hôm nay": [],
      "Hôm qua": [],
      "7 ngày trước": [],
      "Cũ hơn": []
    };

    const filteredSessions = sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredSessions.forEach(session => {
      const date = parseISO(session.createdAt);
      if (isToday(date)) groups["Hôm nay"].push(session);
      else if (isYesterday(date)) groups["Hôm qua"].push(session);
      else if (isThisWeek(date)) groups["7 ngày trước"].push(session);
      else groups["Cũ hơn"].push(session);
    });

    return groups;
  };

  const handleNewChat = () => {
    window.location.href = "/?action=chat";
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-20 left-4 z-50 p-2 rounded-lg bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/80 transition-colors border border-white/10"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>
    );
  }

  const groups = groupSessions();

  return (
    <div className="w-[260px] h-full bg-[#171717] flex flex-col shrink-0 transition-all duration-300 border-r border-white/5 relative z-40">
      <div className="p-3 flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          title="Đóng sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNewChat}
          className="flex-1 flex items-center justify-end gap-2 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          title="Tạo chat mới"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <input 
          type="text" 
          placeholder="Tìm đoạn chat..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center py-4 text-white/50">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-white/40 px-2 py-3">
            Chưa có đoạn chat nào.
          </div>
        ) : (
          Object.entries(groups).map(([label, groupSessions]) => {
            if (groupSessions.length === 0) return null;
            return (
              <div key={label} className="mb-6">
                <h3 className="text-xs font-semibold text-white/40 mb-2 px-2">
                  {label}
                </h3>
                <div className="space-y-1">
                  {groupSessions.map(session => {
                    const isActive = currentSessionId === session.id;
                    return (
                      <a
                        key={session.id}
                        href={`/?action=chat&sessionId=${session.id}`}
                        className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors group ${
                          isActive 
                            ? "bg-[#2f2f2f] text-white" 
                            : "text-white/70 hover:bg-[#212121] hover:text-white"
                        }`}
                      >
                        <span className="truncate flex-1">{session.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
