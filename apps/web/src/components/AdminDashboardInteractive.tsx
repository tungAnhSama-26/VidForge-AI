"use client";

import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { Users, FileText, Activity, Server, Filter, LayoutDashboard, DollarSign, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboardInteractive({ 
  totalVideos,
  totalUsers,
  totalChats,
  totalErrors,
  topPromptsCount,
  recentProjectsCount,
  recentProjectsList, 
  topPrompts,
  chartData,
  chatTrafficData,
  currentRange,
  stats
}: { 
  totalVideos?: string;
  totalUsers?: string;
  totalChats?: string;
  totalErrors?: string;
  topPromptsCount?: string;
  recentProjectsCount?: string;
  recentProjectsList: any[];
  topPrompts: any[];
  chartData: any[];
  chatTrafficData?: any[];
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const defaultStats = [
    { label: "Tổng người dùng", value: totalUsers || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tổng nội dung", value: totalVideos || "0", icon: LayoutDashboard, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Lượt Chat API", value: totalChats || "0", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Lỗi hệ thống", value: totalErrors || "0", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const displayStats = stats?.length ? stats : defaultStats;

  // Pie chart data
  const aiUsageData = [
    { name: 'Video Generation', value: parseInt(totalVideos || "0") || 1 },
    { name: 'Chat API', value: parseInt(totalChats || "0") || 1 },
    { name: 'System Errors', value: parseInt(totalErrors || "0") || 0 }
  ].filter(d => d.value > 0);

  // Map topPrompts to BarChart format
  const topPromptsData = topPrompts.map(p => ({
    name: p.prompt.length > 20 ? p.prompt.substring(0, 20) + '...' : p.prompt,
    count: p.count,
    fullPrompt: p.prompt
  }));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Filter Section */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-white/70">Hệ thống đang hoạt động</span>
        </div>
        <div className="flex gap-3 items-center">
          <Filter className="w-4 h-4 text-white/50" />
          <select 
            value={currentRange}
            onChange={handleRangeChange}
            className="bg-[#1a1a1b] border border-white/10 text-white/90 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">3 tháng qua</option>
            <option value="all">Tất cả thời gian</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Grid - 4 Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#1a1a1b] border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white leading-none">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Middle Row - 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Chart: User Growth / Area Chart */}
        <motion.div variants={itemVariants} className="bg-[#1a1a1b] border border-white/5 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white/90 mb-6">Tăng trưởng hoạt động</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" name="Số lượng" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Chart: Chat Traffic / Line Chart */}
        <motion.div variants={itemVariants} className="bg-[#1a1a1b] border border-white/5 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white/90 mb-6">Lưu lượng API</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chatTrafficData || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - Pie Chart & Horizontal Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: AI Usage Pie Chart */}
        <motion.div variants={itemVariants} className="bg-[#1a1a1b] border border-white/5 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white/90 mb-6">Tỷ lệ sử dụng tính năng</h2>
          <div className="h-[250px] w-full flex items-center justify-center">
            {aiUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {aiUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/40 text-sm">Chưa có dữ liệu</p>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {aiUsageData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-xs text-white/70">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Top Prompts Horizontal Bar Chart */}
        <motion.div variants={itemVariants} className="bg-[#1a1a1b] border border-white/5 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white/90 mb-6">Prompts phổ biến nhất</h2>
          <div className="h-[250px] w-full">
            {topPromptsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topPromptsData}
                  margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(value, name, props) => [value, 'Lượt']}
                    labelFormatter={(label) => `Prompt: ${label}`}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {topPromptsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/40 text-sm">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

