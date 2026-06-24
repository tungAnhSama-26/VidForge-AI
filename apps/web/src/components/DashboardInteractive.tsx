"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Clock, ArrowRight, ImageIcon, MoreHorizontal, Trophy, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function DashboardInteractive({ 
  totalVideos,
  totalDuration,
  topPromptsCount,
  recentProjectsCount,
  recentProjectsList, 
  topPrompts,
  chartData,
  currentRange,
  stats
}: { 
  totalVideos?: string;
  totalDuration?: string;
  topPromptsCount?: string;
  recentProjectsCount?: string;
  recentProjectsList: any[];
  topPrompts: any[];
  chartData: any[];
  currentRange: string;
  stats?: any[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "processing": return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      case "failed": return "text-red-400 bg-red-400/10 border border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "processing": return "Đang xử lý";
      case "failed": return "Lỗi";
      default: return "Chờ xử lý";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const defaultStats = [
    { label: "Tổng số Video/Kịch bản", value: totalVideos || "0", icon: <div className="w-6 h-6 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg></div>, color: "from-purple-500 to-pink-500" },
    { label: "Tổng thời lượng (giây)", value: totalDuration || "0", icon: <div className="w-6 h-6 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>, color: "from-emerald-500 to-teal-500" },
    { label: "Prompt phổ biến", value: topPromptsCount || "0", icon: <div className="w-6 h-6 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>, color: "from-amber-500 to-orange-500" },
    { label: "Dự án mới", value: recentProjectsCount || "0", icon: <div className="w-6 h-6 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>, color: "from-blue-500 to-cyan-500" },
  ];

  const displayStats = stats || defaultStats;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Filter Section */}
      <motion.div variants={itemVariants} className="flex justify-end items-center gap-3">
        <Filter className="w-5 h-5 text-white/50" />
        <select 
          value={currentRange}
          onChange={handleRangeChange}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value="7d" className="bg-gray-900">7 ngày qua</option>
          <option value="30d" className="bg-gray-900">30 ngày qua</option>
          <option value="90d" className="bg-gray-900">3 tháng qua</option>
          <option value="all" className="bg-gray-900">Tất cả thời gian</option>
        </select>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, i) => {
          const Icon = stat.icon;
          const isReactElement = typeof stat.icon === 'object' && stat.icon !== null && 'type' in stat.icon;
          return (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:border-white/20 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 shadow-lg`}>
                  <div className="w-full h-full bg-black/50 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                    {isReactElement ? stat.icon : <Icon className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <h3 className="text-white/60 font-medium">{stat.label}</h3>
              </div>
              <p className="text-4xl font-black text-white relative z-10 tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Chart Section */}
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Biểu đồ Tăng trưởng Video</h2>
        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="count" name="Số video tạo" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-400" />
              Hoạt động gần đây
            </h2>
            <Link href="/dashboard/projects" className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 group">
              Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentProjectsList.length === 0 ? (
                <div className="p-8 text-center text-white/40">Không có dữ liệu trong khoảng thời gian này</div>
              ) : recentProjectsList.map((project) => (
                <div key={project.id} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-colors">
                      <ImageIcon className="w-6 h-6 text-white/50 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg mb-1 group-hover:text-purple-300 transition-colors">{project.title}</h4>
                      <p className="text-white/40 text-sm flex items-center gap-2 max-w-[200px] sm:max-w-xs md:max-w-sm truncate">
                        <span>{project.prompt}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Prompts */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Top Prompts
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            {topPrompts.length === 0 ? (
              <div className="text-center text-white/40 py-4">Không có dữ liệu</div>
            ) : topPrompts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold border border-amber-500/20 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-amber-300 transition-colors" title={p.prompt}>
                    {p.prompt}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Sử dụng {p.count} lần
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
