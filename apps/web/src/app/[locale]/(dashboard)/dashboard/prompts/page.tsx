import { Plus, MessageSquare, Copy, Star, Edit2, Trash2 } from "lucide-react";

export default function PromptsPage() {
  const prompts = [
    { id: 1, title: "Kịch bản Youtube Review", preview: "Viết một kịch bản review sản phẩm công nghệ dài 5 phút, phong cách hài hước...", category: "Kịch bản", uses: 42 },
    { id: 2, title: "Bối cảnh Cyberpunk Cinematic", preview: "Generate a realistic cyberpunk city street at night, neon lights, rainy...", category: "Hình ảnh", uses: 15 },
    { id: 3, title: "Giọng đọc truyền cảm", preview: "Hướng dẫn đọc voice off: giọng nam trầm ấm, tốc độ vừa phải, nhấn nhá ở...", category: "Khác", uses: 8 },
  ];

  return (
    <div className="space-y-6 animate-page-transition p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Prompt</h1>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <Plus className="w-4 h-4" />
          Thêm Prompt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                {prompt.title}
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-white/60 px-2 py-1 rounded-md">
                {prompt.category}
              </span>
            </div>
            
            <p className="text-sm text-white/50 mb-4 line-clamp-2">
              "{prompt.preview}"
            </p>
            
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Star className="w-3.5 h-3.5 text-yellow-500/70" />
                Đã dùng {prompt.uses} lần
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95" title="Sửa">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95" title="Xóa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 hover:text-white hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
