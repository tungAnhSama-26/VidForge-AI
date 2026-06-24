import { Plus, FolderGit2, Search, Edit2, Trash2, Clock } from "lucide-react";

export default function ProjectsPage() {
  const mockProjects = [
    { id: 1, name: "Chiến dịch Tết 2027", scripts: 5, status: "Đang chạy", updated: "2 giờ trước" },
    { id: 2, name: "Series Video Tiktok Cyberpunk", scripts: 12, status: "Đang chạy", updated: "Hôm qua" },
    { id: 3, name: "TVC Quảng cáo Nước Giải Khát", scripts: 2, status: "Hoàn thành", updated: "3 ngày trước" },
    { id: 4, name: "Kịch bản Youtube Review Công nghệ", scripts: 8, status: "Đang chạy", updated: "1 tuần trước" },
  ];

  return (
    <div className="space-y-6 animate-page-transition p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dự án Kịch bản</h1>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <Plus className="w-4 h-4" />
          Tạo dự án mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án..." 
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProjects.map((project) => (
          <div key={project.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FolderGit2 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                <button className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95" title="Sửa">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-white mb-1 group-hover:text-purple-400 transition-colors">{project.name}</h3>
            
            <div className="flex items-center gap-4 mt-6 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${project.status === 'Hoàn thành' ? 'bg-green-500' : 'bg-blue-500'}`} />
                {project.status}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {project.updated}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm">
              <span className="text-white/40">Số kịch bản</span>
              <span className="text-white font-medium">{project.scripts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
