"use client";

import React, { useState } from "react";
import { Search, MoreVertical, Shield, Lock, Unlock, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function AdminUsersInteractive({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const toggleLock = (id: string) => {
    // Optimistic update
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "active" ? "locked" : "active" };
      }
      return u;
    }));
    // TODO: Call API to actually lock/unlock user in DB
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Tìm kiếm email, tên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full bg-[#131314] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Người dùng</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Vai trò</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider text-center">Số dự án</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Đăng nhập lần cuối</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Trạng thái</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{user.name}</p>
                        <p className="text-sm text-white/50 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                        User
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm">
                      {user.projects}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm whitespace-nowrap">{user.lastLogin}</td>
                  <td className="p-4">
                    {user.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Xem chi tiết">
                        <Eye className="w-5 h-5" />
                      </button>
                      {user.role !== "admin" && (
                        <button 
                          onClick={() => toggleLock(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === "active" 
                              ? "text-orange-400 hover:bg-orange-500/20" 
                              : "text-green-400 hover:bg-green-500/20"
                          }`}
                          title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.status === "active" ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </button>
                      )}
                      <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Hiển thị</span>
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="bg-[#131314] border border-white/10 text-white rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dòng trên trang</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              Đang xem {filteredUsers.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} trên tổng {filteredUsers.length}
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  // Simple logic to show max 5 page numbers
                  .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-white/40 px-1">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : "text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
