"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle, XCircle, Wifi, Eye, EyeOff, Settings, Shield, Users, AlertTriangle } from "lucide-react";

type ConfigData = {
  grokApiKey?: string;
  veo3WebhookUrl?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  maxConcurrentVideos?: string;
  maxVideosPerUserPerDay?: string;
  allowNewRegistrations?: string;
  maintenanceMode?: string;
};

type TestStatus = "idle" | "loading" | "success" | "error";

function InputField({ label, id, type = "text", value, onChange, placeholder }: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPass ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-2">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, message }: { status: TestStatus; message: string }) {
  if (status === "idle") return null;
  return (
    <div className={`flex items-center gap-2 mt-2 text-sm px-3 py-2 rounded-lg ${
      status === "loading" ? "bg-white/5 text-white/60" :
      status === "success" ? "bg-green-500/10 text-green-400" :
      "bg-red-500/10 text-red-400"
    }`}>
      {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === "success" && <CheckCircle className="w-4 h-4" />}
      {status === "error" && <XCircle className="w-4 h-4" />}
      <span>{message}</span>
    </div>
  );
}

export default function AdminConfigInteractive({ initialConfig }: { initialConfig: ConfigData }) {
  const [config, setConfig] = useState<ConfigData>({
    grokApiKey: "",
    veo3WebhookUrl: "",
    googleClientId: "",
    googleClientSecret: "",
    maxConcurrentVideos: "100",
    maxVideosPerUserPerDay: "5",
    allowNewRegistrations: "true",
    maintenanceMode: "false",
    ...initialConfig,
  });

  const [savingApi, setSavingApi] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [apiSaveStatus, setApiSaveStatus] = useState<TestStatus>("idle");
  const [limitsSaveStatus, setLimitsSaveStatus] = useState<TestStatus>("idle");
  const [veo3TestStatus, setVeo3TestStatus] = useState<TestStatus>("idle");
  const [veo3TestMsg, setVeo3TestMsg] = useState("");
  const [apiSaveMsg, setApiSaveMsg] = useState("");
  const [limitsSaveMsg, setLimitsSaveMsg] = useState("");

  const update = (key: keyof ConfigData, val: string) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSaveApi = async () => {
    setSavingApi(true);
    setApiSaveStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grokApiKey: config.grokApiKey,
          veo3WebhookUrl: config.veo3WebhookUrl,
          googleClientId: config.googleClientId,
          googleClientSecret: config.googleClientSecret,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiSaveStatus("success");
        setApiSaveMsg("Đã lưu cấu hình API thành công!");
      } else {
        setApiSaveStatus("error");
        setApiSaveMsg(data.error || "Lưu thất bại, vui lòng thử lại.");
      }
    } catch {
      setApiSaveStatus("error");
      setApiSaveMsg("Lỗi kết nối tới server.");
    } finally {
      setSavingApi(false);
      setTimeout(() => setApiSaveStatus("idle"), 5000);
    }
  };

  const handleSaveLimits = async () => {
    setSavingLimits(true);
    setLimitsSaveStatus("idle");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxConcurrentVideos: config.maxConcurrentVideos,
          maxVideosPerUserPerDay: config.maxVideosPerUserPerDay,
          allowNewRegistrations: config.allowNewRegistrations,
          maintenanceMode: config.maintenanceMode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLimitsSaveStatus("success");
        setLimitsSaveMsg("Đã cập nhật giới hạn thành công!");
      } else {
        setLimitsSaveStatus("error");
        setLimitsSaveMsg(data.error || "Cập nhật thất bại.");
      }
    } catch {
      setLimitsSaveStatus("error");
      setLimitsSaveMsg("Lỗi kết nối tới server.");
    } finally {
      setSavingLimits(false);
      setTimeout(() => setLimitsSaveStatus("idle"), 5000);
    }
  };

  const handleTestVeo3 = async () => {
    if (!config.veo3WebhookUrl?.trim()) {
      setVeo3TestStatus("error");
      setVeo3TestMsg("Vui lòng nhập VEO 3 Webhook URL trước.");
      return;
    }
    setVeo3TestStatus("loading");
    setVeo3TestMsg("Đang kiểm tra kết nối...");
    try {
      const res = await fetch("/api/admin/config/test-veo3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: config.veo3WebhookUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setVeo3TestStatus("success");
        setVeo3TestMsg(data.message || "Kết nối thành công!");
      } else {
        setVeo3TestStatus("error");
        setVeo3TestMsg(data.message || "Kết nối thất bại.");
      }
    } catch {
      setVeo3TestStatus("error");
      setVeo3TestMsg("Lỗi server. Không thể kiểm tra.");
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-purple-400" />
          Cấu hình Hệ thống
        </h1>
        <p className="text-white/50">Quản lý kết nối API, giới hạn hệ thống và các cài đặt toàn cục</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* === API CONNECTIONS === */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-sky-400" />
            Kết nối API
          </h2>

          <InputField
            id="grokApiKey"
            label="Grok API Key"
            type="password"
            value={config.grokApiKey || ""}
            onChange={(v) => update("grokApiKey", v)}
            placeholder="gsk-..."
          />

          {/* VEO 3 Webhook with Test Button */}
          <div>
            <label htmlFor="veo3WebhookUrl" className="block text-sm font-medium text-white/70 mb-2">
              VEO 3 Flow Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                id="veo3WebhookUrl"
                type="text"
                value={config.veo3WebhookUrl || ""}
                onChange={(e) => { update("veo3WebhookUrl", e.target.value); setVeo3TestStatus("idle"); }}
                placeholder="https://api.veo3.ai/v1/flow/hook"
                className="flex-1 bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
              />
              <button
                onClick={handleTestVeo3}
                disabled={veo3TestStatus === "loading"}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  veo3TestStatus === "success" ? "bg-green-600/20 border-green-500/50 text-green-400" :
                  veo3TestStatus === "error" ? "bg-red-600/20 border-red-500/50 text-red-400" :
                  "bg-sky-600/20 border-sky-500/50 text-sky-400 hover:bg-sky-600/30"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {veo3TestStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 veo3TestStatus === "success" ? <CheckCircle className="w-4 h-4" /> :
                 veo3TestStatus === "error" ? <XCircle className="w-4 h-4" /> :
                 <Wifi className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {veo3TestStatus === "loading" ? "Đang test..." :
                   veo3TestStatus === "success" ? "Thành công" :
                   veo3TestStatus === "error" ? "Thất bại" :
                   "Test kết nối"}
                </span>
              </button>
            </div>
            {veo3TestStatus !== "idle" && (
              <StatusBadge status={veo3TestStatus} message={veo3TestMsg} />
            )}
          </div>

          <InputField
            id="googleClientId"
            label="Google OAuth Client ID"
            value={config.googleClientId || ""}
            onChange={(v) => update("googleClientId", v)}
            placeholder="xxx.apps.googleusercontent.com"
          />

          <InputField
            id="googleClientSecret"
            label="Google OAuth Client Secret"
            type="password"
            value={config.googleClientSecret || ""}
            onChange={(v) => update("googleClientSecret", v)}
            placeholder="GOCSPX-..."
          />

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleSaveApi}
              disabled={savingApi}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {savingApi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingApi ? "Đang lưu..." : "Lưu cấu hình API"}
            </button>
            <StatusBadge status={apiSaveStatus} message={apiSaveMsg} />
          </div>
        </div>

        {/* === SYSTEM LIMITS === */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Giới hạn & Kiểm soát
          </h2>

          <div>
            <label htmlFor="maxConcurrentVideos" className="block text-sm font-medium text-white/70 mb-2">
              Số video tạo đồng thời tối đa (Toàn hệ thống)
            </label>
            <input
              id="maxConcurrentVideos"
              type="number"
              min={1}
              value={config.maxConcurrentVideos || ""}
              onChange={(e) => update("maxConcurrentVideos", e.target.value)}
              className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="maxVideosPerUserPerDay" className="block text-sm font-medium text-white/70 mb-2">
              Số video mỗi người dùng / ngày (Free Tier)
            </label>
            <input
              id="maxVideosPerUserPerDay"
              type="number"
              min={1}
              value={config.maxVideosPerUserPerDay || ""}
              onChange={(e) => update("maxVideosPerUserPerDay", e.target.value)}
              className="w-full bg-[#131314] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/90">Cho phép đăng ký mới</p>
                  <p className="text-xs text-white/40 mt-0.5">Người dùng mới có thể tạo tài khoản</p>
                </div>
              </div>
              <div
                onClick={() => update("allowNewRegistrations", config.allowNewRegistrations === "true" ? "false" : "true")}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${config.allowNewRegistrations === "true" ? "bg-green-500" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.allowNewRegistrations === "true" ? "translate-x-7" : "translate-x-1"}`} />
              </div>
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/90">Chế độ Bảo trì</p>
                  <p className="text-xs text-white/40 mt-0.5">Chặn người dùng thường truy cập hệ thống</p>
                </div>
              </div>
              <div
                onClick={() => update("maintenanceMode", config.maintenanceMode === "true" ? "false" : "true")}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${config.maintenanceMode === "true" ? "bg-orange-500" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.maintenanceMode === "true" ? "translate-x-7" : "translate-x-1"}`} />
              </div>
            </label>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleSaveLimits}
              disabled={savingLimits}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {savingLimits ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingLimits ? "Đang cập nhật..." : "Cập nhật giới hạn"}
            </button>
            <StatusBadge status={limitsSaveStatus} message={limitsSaveMsg} />
          </div>
        </div>
      </div>
    </div>
  );
}
