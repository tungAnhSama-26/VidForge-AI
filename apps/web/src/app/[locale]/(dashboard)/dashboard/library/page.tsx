import { Clapperboard, FileText, Image as ImageIcon, Search, Filter, Download } from "lucide-react";

export default function LibraryPage() {
  const assets = [
    { id: 1, type: "image", name: "Bãi biển Cyberpunk_01.png", date: "Hôm nay", size: "2.4 MB", url: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80" },
    { id: 2, type: "image", name: "Bãi biển Cyberpunk_02.png", date: "Hôm nay", size: "2.1 MB", url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&q=80" },
    { id: 3, type: "script", name: "Kịch bản Quảng cáo Pepsi.docx", date: "Hôm qua", size: "15 KB" },
    { id: 4, type: "script", name: "Concept Art Prompts.txt", date: "2 ngày trước", size: "4 KB" },
  ];

  return (
    <div className="space-y-6 animate-page-transition p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Thư viện Nội dung</h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài nguyên..." 
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-sm">
          <Filter className="w-4 h-4 text-white/60" />
          Lọc
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/20 transition-colors cursor-pointer">
            <div className="aspect-square bg-white/5 relative flex items-center justify-center">
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-10 h-10 text-blue-400" />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 active:scale-95 shadow-lg">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="text-sm font-medium text-white truncate">{asset.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-white/40">{asset.date}</span>
                <span className="text-[11px] text-white/40">{asset.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
