"use client";

import React, { useState } from "react";
import {
  Search, FileText, CheckCircle2, XCircle, Clock, Trash2,
  RotateCcw, FileSpreadsheet, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Eye, X, User, Calendar,
  Hash, Activity
} from "lucide-react";
import * as XLSX from 'xlsx';

type ContentItem = {
  id: string;
  title: string;
  user: string;
  status: string;
  images: number;
  createdAt: string;
  views: number;
};

function ContentDetailModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    completed: { label: "Hoàn thành", color: "text-emerald-400 bg-emerald-500/10", icon: <CheckCircle2 className="w-4 h-4" /> },
    failed: { label: "Thất bại", color: "text-rose-400 bg-rose-500/10", icon: <XCircle className="w-4 h-4" /> },
    processing: { label: "Đang xử lý", color: "text-amber-400 bg-amber-500/10", icon: <Clock className="w-4 h-4" /> },
    pending: { label: "Chờ xử lý", color: "text-sky-400 bg-sky-500/10", icon: <Clock className="w-4 h-4" /> },
  };
  const s = statusConfig[item.status] || { label: item.status, color: "text-white/60 bg-white/5", icon: null };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white">Chi tiết nội dung</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Title block */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white leading-tight break-words">{item.title}</p>
              <p className="text-xs text-white/40 font-mono mt-1 truncate">ID: {item.id}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="grid grid-cols-1 gap-3">
            <InfoRow
              icon={<Activity className="w-4 h-4 text-indigo-400" />}
              label="Trạng thái"
              value={
                <span className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-xs font-medium ${s.color}`}>
                  {s.icon}{s.label}
                </span>
              }
            />
            <InfoRow
              icon={<User className="w-4 h-4 text-purple-400" />}
              label="Tác giả"
              value={item.user || "Người dùng ẩn danh"}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-sky-400" />}
              label="Thời gian tạo"
              value={item.createdAt}
            />
            <InfoRow
              icon={<Hash className="w-4 h-4 text-amber-400" />}
              label="Số ảnh đính kèm"
              value={<span className="text-white font-semibold">{item.images}</span>}
            />
            <InfoRow
              icon={<Eye className="w-4 h-4 text-emerald-400" />}
              label="Lượt xem"
              value={<span className="text-white font-semibold">{item.views.toLocaleString()}</span>}
            />
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="shrink-0">{icon}</div>
      <span className="text-sm text-white/50 w-36 shrink-0">{label}</span>
      <div className="text-sm text-white/80 truncate">{value}</div>
    </div>
  );
}

export default function AdminContentInteractive({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTimeFilter("all");
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filteredItems = items.filter(i => {
    const matchesSearch =
      i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.user?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
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
    const exportData = filteredItems.map((item, index) => {
      const statusLabels: Record<string, string> = {
        completed: "Hoàn thành",
        failed: "Thất bại",
        processing: "Đang xử lý",
        pending: "Chờ xử lý"
      };

      return {
        "STT": index + 1,
        "ID": item.id,
        "Tên kịch bản": item.title,
        "Tác giả": item.user || "Người dùng ẩn danh",
        "Trạng thái": statusLabels[item.status] || item.status,
        "Ngày tạo": item.createdAt,
        "Số ảnh": item.images,
        "Lượt xem": item.views
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Content");
    
    // Generate buffer and download
    XLSX.writeFile(workbook, "Danh_sach_kich_ban.xlsx");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Hoàn thành</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium"><XCircle className="w-3.5 h-3.5" />Thất bại</span>;
      case "processing":
        return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium"><Clock className="w-3.5 h-3.5" />Đang xử lý</span>;
      default:
        return <span className="text-white/60 text-xs">{status}</span>;
    }
  };

  return (
    <>
      {/* Detail Modal */}
      {selectedItem && (
        <ContentDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <div className="p-8">
        {/* Screen Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý nội dung</h1>
          <p className="text-white/60">Xem và quản lý các kịch bản, video được tạo bởi người dùng</p>
        </div>

        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Tìm kiếm kịch bản, tác giả..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#1a1a1b] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

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

        {/* Table */}
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
                            <span className="text-xs text-white/50 truncate block mt-0.5 font-mono">{item.id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{item.user || "—"}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-white/60">{item.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Eye - Xem chi tiết */}
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-all hover:scale-110 active:scale-95"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-all hover:scale-110 active:scale-95"
                            title="Xóa"
                          >
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

          {/* Pagination */}
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
