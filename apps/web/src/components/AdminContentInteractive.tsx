"use client";

import { useState } from "react";
import { Search, FileText, MoreVertical, CheckCircle2, XCircle, Clock, Trash2, ExternalLink } from "lucide-react";

export default function AdminContentInteractive({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(v => 
    v.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteItem = (id: string) => {
    setItems(items.filter(v => v.id !== id));
    // TODO: Call API to delete
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Đang xử lý
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Đang đợi
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Toàn bộ Kịch bản</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tiêu đề, người tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131314] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Nội dung</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Người tạo</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Trạng thái</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Số Ảnh</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Thời gian</th>
                <th className="p-4 font-semibold text-white/60 text-sm uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        {item.status === "completed" ? (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/50 to-blue-900/50 opacity-50"></div>
                            <FileText className="w-5 h-5 text-white opacity-80 group-hover:opacity-100 transition-opacity z-10" />
                          </>
                        ) : (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                        )}
                      </div>
                      <p className="font-medium text-white line-clamp-1" title={item.title}>{item.title}</p>
                    </div>
                  </td>
                  <td className="p-4 text-white/70 text-sm" title={item.user}>{item.user}</td>
                  <td className="p-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-4 text-white/70 text-sm">{item.images} ảnh</td>
                  <td className="p-4 text-white/50 text-sm">{item.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Xem chi tiết">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" 
                        title="Xóa nội dung"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">
                    Không tìm thấy nội dung nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
