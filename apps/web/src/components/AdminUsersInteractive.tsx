"use client";

import React, { useState } from "react";
import { Search, FileSpreadsheet, RotateCcw, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function AdminUsersInteractive({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  // Filter users based on search, status, and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter;
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
              placeholder="Tìm kiếm người dùng..."
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
            <option value="active">Hoạt động</option>
            <option value="locked">Tạm ngưng</option>
          </select>

          {/* Role Filter */}
          <select 
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#1a1a1b] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/80 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
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
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">NGƯỜI DÙNG</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">EMAIL</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">VAI TRÒ</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">GÓI</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider">NGÀY THAM GIA</th>
                <th className="px-6 py-4 font-semibold text-white/60 uppercase tracking-wider text-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map((user, index) => {
                const rowIndex = startIndex + index + 1;
                // Still keeping "PREMIUM" display logic based on role just for visual matching the screenshot if needed, 
                // or just remove the GÓI column. The user said "k có gói cước nào nên là lọc theo role nhé", 
                // but the table still has a "GÓI" column based on the screenshot. I'll leave the column visual there.
                const isPremium = user.role === "admin"; 
                
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white/50">{rowIndex}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "U"}
                          </div>
                        )}
                        <span className="font-medium text-white/90">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">
                          Quản trị viên
                        </span>
                      ) : (
                        <span className="inline-flex items-center py-1 px-3 rounded-full bg-white/5 text-white/60 text-xs font-medium">
                          Người dùng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isPremium ? (
                        <span className="inline-flex items-center py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs font-medium px-3">
                          Miễn phí
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center py-1 px-3 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium">
                          Tạm ngưng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {user.lastLogin || new Date(user.createdAt || Date.now()).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors opacity-70 group-hover:opacity-100 mx-auto block" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/50">
                    Không tìm thấy người dùng nào phù hợp.
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

