"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, Info, CheckCircle, ShieldAlert, RotateCcw, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, X, User, Clock, Activity, Target } from "lucide-react";
import * as XLSX from 'xlsx';

type LogItem = {
  id: string;
  type: string;
  action: string;
  user: string;
  ip: string;
  target: string;
  time: string;
};

function LogDetailModal({ log, onClose }: { log: LogItem; onClose: () => void }) {
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

  const getBadgeColor = (type: string) => {
    switch(type) {
      case "info": return "text-blue-400 bg-blue-500/10";
      case "warning": return "text-yellow-400 bg-yellow-500/10";
      case "error": return "text-red-400 bg-red-500/10";
      case "success": return "text-green-400 bg-green-500/10";
      case "security": return "text-purple-400 bg-purple-500/10";
      default: return "text-white/60 bg-white/5";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {getLogIcon(log.type)}
            <span>Chi tiết nhật ký</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{log.action}</h3>
              <p className="text-sm text-white/50 font-mono">ID: {log.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getBadgeColor(log.type)}`}>
              {log.type}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-sm text-white/50 w-32 shrink-0">Thời gian</span>
              <span className="text-sm text-white/90">{log.time}</span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <User className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-sm text-white/50 w-32 shrink-0">Người dùng</span>
              <span className="text-sm text-white/90 truncate">{log.user}</span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-white/50 w-32 shrink-0">Địa chỉ IP</span>
              <span className="text-sm text-white/90 font-mono">{log.ip}</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-white/50 w-32 shrink-0">Mục tiêu</span>
              <span className="text-sm text-white/90">{log.target || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogsInteractive({ initialLogs }: { initialLogs: any[] }) {
  const [logs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setTimeFilter("all");
    setCurrentPage(1);
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.user?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" ? true : l.type === typeFilter;
    const matchesTime = true; // Mock time filter for now

    return matchesSearch && matchesType && matchesTime;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPaginationGroup = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleExportExcel = () => {
    const exportData = filteredLogs.map((log, index) => ({
      "STT": index + 1,
      "ID": log.id,
      "Thời gian": log.time,
      "Mức độ": log.type.toUpperCase(),
      "Hành động": log.action,
      "Người dùng": log.user,
      "IP": log.ip,
      "Mục tiêu": log.target || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    
    XLSX.writeFile(workbook, "Nhat_ky_he_thong.xlsx");
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case "info": return <Info className="w-4 h-4 text-blue-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "security": return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogBadge = (type: string) => {
    switch(type) {
      case "info": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">{getLogIcon(type)} Info</span>;
      case "warning": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">{getLogIcon(type)} Warning</span>;
      case "error": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">{getLogIcon(type)} Error</span>;
      case "success": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">{getLogIcon(type)} Success</span>;
      case "security": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">{getLogIcon(type)} Security</span>;
      default: 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/5 text-white/60 text-xs font-medium">{getLogIcon(type)} Unknown</span>;
    }
  };

  return (
    <>
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nhật ký hệ thống</h1>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Tìm kiếm hành động, user..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#1a1a1b] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#1a1a1b] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/80 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[140px]"
            >
              <option value="all">Tất cả loại</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
              <option value="security">Security</option>
            </select>

            <select 
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#1a1a1b] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/80 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[140px]"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>

            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1b] border border-white/10 text-white/80 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại</span>
            </button>
          </div>

          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium whitespace-nowrap w-full lg:w-auto justify-center"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>

        <div className="bg-[#1a1a1b] border border-white/10 rounded-xl overflow-hidden flex flex-col font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10 font-sans">
                <tr>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">THỜI GIAN</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">MỨC ĐỘ</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">HÀNH ĐỘNG</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">NGƯỜI DÙNG</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">IP / MỤC TIÊU</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider text-center">CHI TIẾT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedLogs.map((log, index) => {
                  const rowIndex = startIndex + index + 1;
                  return (
                    <tr key={log.id || index} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-white/50">{rowIndex}</td>
                      <td className="px-6 py-4 text-white/60">{log.time}</td>
                      <td className="px-6 py-4">{getLogBadge(log.type)}</td>
                      <td className="px-6 py-4 text-white/90 font-medium">{log.action}</td>
                      <td className="px-6 py-4 text-purple-300">{log.user}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white/60">{log.ip}</span>
                          {log.target && <span className="text-blue-300 text-xs mt-0.5">{log.target}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors opacity-70 group-hover:opacity-100 mx-auto block hover:scale-110 active:scale-95" 
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/50 font-sans">
                      Không tìm thấy nhật ký nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/10 bg-[#1a1a1b] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            <div className="flex items-center">
              <select 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange}
                className="bg-white/5 border border-white/10 text-white/80 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors mr-1">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPaginationGroup().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="w-8 text-center text-white/40 text-sm">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[32px] h-8 px-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? "bg-indigo-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors ml-1">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
