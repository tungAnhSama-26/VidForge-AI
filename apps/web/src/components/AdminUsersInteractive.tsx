"use client";

import React, { useState } from "react";
import {
  Search, FileSpreadsheet, RotateCcw, Eye,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  X, Mail, Shield, Calendar, FolderKanban, User
} from "lucide-react";
import * as XLSX from 'xlsx';

type UserItem = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  status: string;
  lastLogin: string;
  projects: number;
};

function UserDetailModal({ user, onClose }: { user: UserItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {user.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <p className="text-xl font-bold text-white">{user.name}</p>
              <p className="text-sm text-white/50 mt-0.5">ID: <span className="font-mono text-indigo-400">{user.id.substring(0, 8)}...</span></p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-3">
            <InfoRow icon={<Mail className="w-4 h-4 text-indigo-400" />} label="Email" value={user.email} />
            <InfoRow
              icon={<Shield className="w-4 h-4 text-purple-400" />}
              label="Vai trò"
              value={
                <span className={`inline-flex items-center py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-white/5 text-white/60"
                }`}>
                  {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              }
            />
            <InfoRow
              icon={<User className="w-4 h-4 text-emerald-400" />}
              label="Trạng thái"
              value={
                <span className={`inline-flex items-center py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  user.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}>
                  {user.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                </span>
              }
            />
            <InfoRow
              icon={<FolderKanban className="w-4 h-4 text-amber-400" />}
              label="Số dự án"
              value={<span className="text-white font-semibold">{user.projects}</span>}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-sky-400" />}
              label="Hoạt động lần cuối"
              value={user.lastLogin}
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="shrink-0">{icon}</div>
      <span className="text-sm text-white/50 w-36 shrink-0">{label}</span>
      <div className="text-sm text-white/80 truncate">{value}</div>
    </div>
  );
}

export default function AdminUsersInteractive({ initialUsers }: { initialUsers: any[] }) {
  const [users] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter;
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
    const exportData = filteredUsers.map((u, index) => ({
      "STT": index + 1,
      "ID": u.id,
      "Tên người dùng": u.name,
      "Email": u.email,
      "Vai trò": u.role === "admin" ? "Quản trị viên" : "Người dùng",
      "Trạng thái": u.status === "active" ? "Hoạt động" : "Tạm ngưng",
      "Ngày tham gia": u.lastLogin || new Date(u.createdAt || Date.now()).toLocaleDateString("vi-VN"),
      "Số dự án": u.projects
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
    // Generate buffer and download
    XLSX.writeFile(workbook, "Danh_sach_nguoi_dung.xlsx");
  };

  return (
    <>
      {/* Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <div className="p-8">
        {/* Screen Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý người dùng</h1>
        </div>

        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
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
              <option value="active">Hoạt động</option>
              <option value="locked">Tạm ngưng</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#1a1a1b] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/80 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[140px]"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
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
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">NGƯỜI DÙNG</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">VAI TRÒ</th>

                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">TRẠNG THÁI</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">NGÀY THAM GIA</th>
                  <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider text-center">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.map((user, index) => {
                  const rowIndex = startIndex + index + 1;
                  const isPremium = user.role === "admin";
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-white/50">{rowIndex}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {user.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
                            </div>
                          )}
                          <span className="font-medium text-white/90">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">Quản trị viên</span>
                        ) : (
                          <span className="inline-flex items-center py-1 px-3 rounded-full bg-white/5 text-white/60 text-xs font-medium">Người dùng</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">Hoạt động</span>
                        ) : (
                          <span className="inline-flex items-center py-1 px-3 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium">Tạm ngưng</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {user.lastLogin || new Date(user.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all opacity-70 group-hover:opacity-100 mx-auto block hover:scale-110 active:scale-95"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/50">
                      Không tìm thấy người dùng nào phù hợp.
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
