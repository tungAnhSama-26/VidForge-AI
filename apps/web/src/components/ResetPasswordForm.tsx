"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/routing";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const t = useTranslations("ResetPasswordPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "invalid">("idle");
  const [message, setMessage] = useState("");

  // Kiểm tra token tồn tại
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Link đặt lại mật khẩu không hợp lệ.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        // Auto redirect sau 3 giây
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 relative group">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-blue-600/10 to-purple-600/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-2 md:p-3 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row gap-4 items-stretch">

        {/* Left Side: The Form */}
        <div className="flex-1 w-full p-8 md:p-12 lg:p-16 relative z-10 flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />

          <div className="relative z-10">
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-gray-400 text-base">
                {t("subtitle")}
              </p>
            </div>

            {/* Invalid token state */}
            {status === "invalid" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-5 py-8 px-6 rounded-3xl bg-red-500/10 border border-red-500/20">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg mb-2">{t("invalidTitle")}</p>
                    <p className="text-gray-400 text-sm">{t("invalidDesc")}</p>
                  </div>
                </div>
                <Link
                  href="/forgot-password"
                  className="block w-full py-4 rounded-2xl bg-white text-black text-center font-bold hover:scale-[1.02] transition-all duration-300"
                >
                  {t("requestNewLink")}
                </Link>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-5 py-8 px-6 rounded-3xl bg-green-500/10 border border-green-500/20">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg mb-2">{t("successTitle")}</p>
                    <p className="text-gray-400 text-sm">{t("successDesc")}</p>
                    <p className="text-green-400 text-xs mt-3 animate-pulse">{t("redirecting")}</p>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="block w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-white text-center font-medium hover:bg-white/20 transition-all duration-300"
                >
                  {t("goToLogin")}
                </Link>
              </div>
            )}

            {/* Form State */}
            {(status === "idle" || status === "error") && !token ? null : (status === "idle" || status === "error") && (
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Error Alert */}
                {status === "error" && (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {message}
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    {t("newPasswordLabel")}
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500 group-focus-within/input:text-green-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("newPasswordPlaceholder")}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    {t("confirmPasswordLabel")}
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500 group-focus-within/input:text-green-400 transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("confirmPasswordPlaceholder")}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-green-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-4 rounded-2xl bg-white text-black text-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none group/btn"
                >
                  {isLoading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      {t("submitButton")}
                    </>
                  )}
                </button>

                <div className="text-center text-gray-400 text-sm">
                  <Link href="/login" className="text-white font-semibold hover:underline hover:text-purple-400 transition-colors">
                    {t("backToLogin")}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Visual Panel */}
        <div className="hidden md:flex flex-1 w-full min-h-[500px] relative rounded-[2rem] overflow-hidden group/right shadow-inner">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover/right:opacity-70 transition-all duration-1000 group-hover/right:scale-110" />

          <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black/40 to-blue-900/60 mix-blend-multiply group-hover/right:opacity-50 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute top-10 right-10 w-24 h-24 bg-green-500/20 blur-[30px] rounded-full group-hover/right:bg-green-500/40 group-hover/right:scale-150 transition-all duration-1000" />
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/20 blur-[40px] rounded-full group-hover/right:bg-blue-500/40 group-hover/right:scale-150 transition-all duration-1000" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] group-hover/right:shadow-[0_0_80px_rgba(59,130,246,0.6)] group-hover/right:scale-110 group-hover/right:-translate-y-[60%] transition-all duration-700 ease-out z-20">
            <ShieldCheck className="w-12 h-12 text-white/80 group-hover/right:text-green-400 group-hover/right:rotate-12 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-12 translate-y-8 group-hover/right:translate-y-0 opacity-0 group-hover/right:opacity-100 transition-all duration-700 ease-out z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 animate-pulse-slow">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">VidForge.AI</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">
              New password,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Fresh start</span>
            </h3>
            <p className="text-gray-300 text-lg max-w-sm drop-shadow-md">
              Secure your account with a strong new password.
            </p>
          </div>

          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-30" />
        </div>

      </div>
    </div>
  );
}
