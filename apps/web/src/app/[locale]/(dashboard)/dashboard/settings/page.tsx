import { User, Mail, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-page-transition p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Cài đặt & Hồ sơ</h1>
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Thông tin cá nhân
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full bg-[#1a1a1a] rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors mb-2">
                Đổi ảnh đại diện
              </button>
              <p className="text-xs text-white/40">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Tên hiển thị</label>
              <input 
                type="text" 
                defaultValue="User Name"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input 
                type="email" 
                defaultValue="user@example.com"
                disabled
                className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-2.5 text-sm text-white/50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
