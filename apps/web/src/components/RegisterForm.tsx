"use client";

import { Link, useRouter } from "@/routing";
import { Mail, Lock, User, UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function RegisterForm() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đăng ký thành công! Đang đăng nhập...");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/"
        });
        if (!loginRes?.error) {
          window.location.href = "/";
        } else {
          router.push("/login");
        }
      } else {
        alert(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/10 to-blue-600/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-2 md:p-3 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row gap-4 items-stretch">
        
        <div className="flex-1 w-full p-8 md:p-12 lg:p-16 relative z-10 flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3 tracking-tight">
                {t("title")}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  {t("nameLabel")}
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  {t("emailLabel")}
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  {t("passwordLabel")}
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-pink-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-pink-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-4 rounded-2xl bg-white text-black text-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all duration-300 group/btn disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    {t("registerButton")}
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative px-6 bg-transparent backdrop-blur-xl text-sm text-gray-500 font-medium">
                {t("orContinueWith")}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full py-4 rounded-2xl bg-[#131314] border border-white/10 text-white text-lg font-medium flex items-center justify-center gap-3 hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.79 15.69 17.57V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.57C14.71 18.23 13.47 18.63 12 18.63C9.16 18.63 6.76 16.71 5.9 14.14H2.21V17.01C4.01 20.59 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.9 14.14C5.68 13.48 5.56 12.76 5.56 12C5.56 11.24 5.68 10.52 5.9 9.86V6.99H2.21C1.47 8.46 1.04 10.18 1.04 12C1.04 13.82 1.47 15.54 2.21 17.01L5.9 14.14Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.34 3.88C17.45 2.12 14.97 1.04 12 1.04C7.7 1.04 4.01 3.41 2.21 6.99L5.9 9.86C6.76 7.29 9.16 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                {t("googleButton")}
              </button>
            </div>

            <div className="mt-10 text-center text-gray-400">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-white font-semibold hover:underline hover:text-pink-400 transition-colors">
                {t("signIn")}
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 w-full min-h-[600px] relative rounded-[2rem] overflow-hidden group/right shadow-inner">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover/right:opacity-70 transition-all duration-1000 group-hover/right:scale-110" />
          
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-black/40 to-blue-900/60 mix-blend-multiply group-hover/right:opacity-50 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          <div className="absolute top-10 right-10 w-24 h-24 bg-purple-500/20 blur-[30px] rounded-full group-hover/right:bg-purple-500/40 group-hover/right:scale-150 transition-all duration-1000" />
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/20 blur-[40px] rounded-full group-hover/right:bg-blue-500/40 group-hover/right:scale-150 transition-all duration-1000" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.3)] group-hover/right:shadow-[0_0_80px_rgba(168,85,247,0.6)] group-hover/right:scale-110 group-hover/right:-translate-y-[60%] transition-all duration-700 ease-out z-20">
            <Sparkles className="w-12 h-12 text-white/80 group-hover/right:text-purple-400 group-hover/right:rotate-12 group-hover:scale-110 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-12 translate-y-8 group-hover/right:translate-y-0 opacity-0 group-hover/right:opacity-100 transition-all duration-700 ease-out z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 animate-pulse-slow">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">{t("brandName")}</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">
              {t("sloganFull").split(t("sloganHighlight"))[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">{t("sloganHighlight")}</span>{t("sloganFull").split(t("sloganHighlight"))[1]}
            </h3>
            <p className="text-gray-300 text-lg max-w-sm drop-shadow-md">
              {t("description")}
            </p>
          </div>
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-30" />
        </div>

      </div>
    </div>
  );
}
