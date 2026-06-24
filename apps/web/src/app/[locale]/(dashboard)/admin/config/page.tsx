"use client";

import { Save } from "lucide-react";

export default function AdminConfigPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cấu hình Hệ thống</h1>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Kết nối API</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Grok API Key</label>
              <input 
                type="password" 
                defaultValue="grok-api-key-hidden-*******************"
                className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Veo3 Flow Webhook URL</label>
              <input 
                type="text" 
                defaultValue="https://api.veo3.ai/v1/flow/hook"
                className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Google OAuth Client ID</label>
              <input 
                type="text" 
                defaultValue="852171550779-km0teuu1h26mtr81lt0smj1hnjq10u9l.apps.googleusercontent.com"
                className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <button className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
            <Save className="w-5 h-5" />
            Lưu thay đổi API
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Giới hạn Hệ thống (Rate Limit)</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Giới hạn Video tạo đồng thời (Toàn hệ thống)</label>
              <input 
                type="number" 
                defaultValue={100}
                className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Giới hạn Video mỗi User / Ngày (Free Tier)</label>
              <input 
                type="number" 
                defaultValue={5}
                className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-black text-purple-600 focus:ring-purple-500" />
                <span className="text-white/80">Cho phép người dùng mới đăng ký</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-black text-purple-600 focus:ring-purple-500" />
                <span className="text-white/80">Bật chế độ Bảo trì (Maintenance Mode)</span>
              </label>
            </div>
          </div>
          
          <button className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
            <Save className="w-5 h-5" />
            Cập nhật giới hạn
          </button>
        </div>
      </div>
    </div>
  );
}
