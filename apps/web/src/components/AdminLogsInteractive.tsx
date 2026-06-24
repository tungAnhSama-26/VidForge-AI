"use client";

import { useState } from "react";
import { Search, AlertTriangle, Info, CheckCircle, ShieldAlert } from "lucide-react";

export default function AdminLogsInteractive({ initialLogs }: { initialLogs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = initialLogs.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogIcon = (type: string) => {
    switch(type) {
      case "info": return <Info className="w-5 h-5 text-blue-400" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "error": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "security": return <ShieldAlert className="w-5 h-5 text-purple-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Nhật ký Hệ thống (Logs)</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo hành động, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131314] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#131314] border border-white/10 rounded-2xl overflow-hidden font-mono text-sm">
        {filteredLogs.map((log, index) => (
          <div key={log.id} className={`flex flex-col sm:flex-row gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
            <div className="flex items-start gap-3 min-w-[200px]">
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div>
                <p className="text-white/50">{log.time}</p>
                <p className="text-white/40 text-xs">IP: {log.ip}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium mb-1">{log.action}</p>
              <div className="flex items-center gap-2 text-white/60">
                <span>Actor:</span>
                <span className="text-purple-300">{log.user}</span>
                {log.target && (
                  <>
                    <span>→ Target:</span>
                    <span className="text-blue-300">{log.target}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-white/50">
            Không tìm thấy nhật ký phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
