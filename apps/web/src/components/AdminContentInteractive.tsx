"use client";

import React, { useState } from "react";
import { Search, FileText, CheckCircle2, XCircle, Clock, Trash2, ExternalLink, RotateCcw, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function AdminContentInteractive({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTimeFilter("all");
    setCurrentPage(1);
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : i.status === statusFilter;
    const matchesTime = timeFilter === "all" ? true : true; // Mock time filter

    return matchesSearch && matchesStatus && matchesTime;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

  // Generate pagination array with max 5 numbers + ellipsis
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-rose-400" />;
      case "processing": return <Clock className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">{getStatusIcon(status)} Hoàn thành</span>;
      case "failed": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium">{getStatusIcon(status)} Thất bại</span>;
      case "processing": 
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">{getStatusIcon(status)} Đang xử lý</span>;
      default: 
        return <span className="text-white/60 text-xs">{status}</span>;
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
              placeholder="Tìm kiếm kịch bản, tác giả..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1a1a1b] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#1a1a1b] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/80 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="processing">Đang xử lý</option>
            <option value="failed">Thất bại</option>
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
      <div className="bg-[#1a1a1b] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">KỊCH BẢN</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">TÁC GIẢ</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">THỜI GIAN TẠO</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider text-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedItems.map((item, index) => {
                const rowIndex = startIndex + index + 1;
                
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white/50">{rowIndex}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-white/60" />
                        </div>
                        <div className="max-w-[200px] truncate">
                          <span className="font-medium text-white/90 truncate block">{item.title}</span>
                          <span className="text-xs text-white/50 truncate block mt-0.5">{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{item.author}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {item.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-md transition-colors" title="Xem chi tiết">
                          <ExternalLink className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">
                    Không tìm thấy nội dung nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Bottom Pagination Bar */}
        <div className="p-4 border-t border-white/10 bg-[#1a1a1b] flex flex-col sm:flex-row items-center justify-between gap-4">
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
