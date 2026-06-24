"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, Info, CheckCircle, ShieldAlert, RotateCcw, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from "lucide-react";

export default function AdminLogsInteractive({ initialLogs }: { initialLogs: any[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

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
    const matchesTime = timeFilter === "all" ? true : true; // Mock time filter

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
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
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
    <div className="p-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Tìm kiếm hành động, user..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1a1a1b] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          {/* Type Filter */}
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

          {/* Time Filter */}
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

          {/* Reset Button */}
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1b] border border-white/10 text-white/80 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium whitespace-nowrap w-full lg:w-auto justify-center">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Table Container */}
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
                      <button className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors opacity-70 group-hover:opacity-100 mx-auto block" title="Xem chi tiết">
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
        
        {/* Bottom Pagination Bar */}
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
            {/* First Page */}
            <button 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {/* Prev Page */}
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors mr-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Numbers */}
            {getPaginationGroup().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="w-8 text-center text-white/40 text-sm">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`min-w-[32px] h-8 px-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page 
                        ? "bg-indigo-600 text-white" 
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Page */}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors ml-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Last Page */}
            <button 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
