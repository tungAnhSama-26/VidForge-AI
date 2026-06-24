import Link from "next/link";
import Image from "next/image";
import { Layers, Sparkles, Video, Play, Zap, Shield, Phone, Info, Cpu, Wand2, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import GenerateInteractive from "@/components/GenerateInteractive";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/ChatSidebar";

export default async function Home({ 
  params,
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  
  if (resolvedSearchParams?.action === 'chat') {
    if (!session?.user) {
      redirect('/login');
    }
    const sessionId = typeof resolvedSearchParams?.sessionId === 'string' ? resolvedSearchParams.sessionId : undefined;
    
    return (
      <div className="relative font-sans h-screen pt-16 flex overflow-hidden bg-[#212121]">
        {/* OpenAI style sidebar */}
        <ChatSidebar currentSessionId={sessionId} />
        
        {/* Chat Area */}
        <div className="relative z-10 flex-1 w-full overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full pointer-events-none animate-float-delayed" />
          </div>
          <GenerateInteractive sessionId={sessionId} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-600/20 blur-[150px] rounded-full pointer-events-none animate-float-delayed" />
        <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none animate-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 hover:bg-white/10 transition-colors animate-fade-in-up hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">{t('hero.badge')}</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] animate-float relative group cursor-default">
          <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          {t('hero.title_1')} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-gradient hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-300">
            {t('hero.title_2')}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-100">
          {t('hero.desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-200">
          <Link href="/?action=chat" className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:scale-110 hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_10px_40px_rgba(168,85,247,0.6)] transition-all duration-300 flex items-center gap-2 group">
            {t('hero.cta')}
            <Sparkles className="w-4 h-4 text-purple-600 group-hover:text-pink-500 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300" />
          </Link>
          <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-sm group flex items-center gap-2">
            {t('hero.gallery')}
            <Play className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Dashboard Mockup / Video Preview area */}
        <div className="mt-24 relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="relative rounded-2xl border border-white/10 bg-black/50 overflow-hidden shadow-2xl shadow-purple-500/20 backdrop-blur-xl aspect-video">
            {/* Fake UI Header */}
            <div className="absolute top-0 w-full h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-full max-w-md mx-auto h-6 bg-white/5 rounded-md border border-white/10 flex items-center px-3">
                <span className="text-[10px] text-gray-400 font-mono">{t('hero.prompt')}</span>
              </div>
            </div>
            
            <div className="w-full h-full pt-12 flex items-center justify-center relative">
               <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop')] bg-cover bg-center" />
               
               <div className="relative z-10 text-center">
                 <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md animate-pulse">
                   <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-32 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-gray-400">{t('features.desc')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: t('features.list.0.title'),
              desc: t('features.list.0.desc'),
              icon: <Cpu className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />,
              delay: 'delay-100'
            },
            {
              title: t('features.list.1.title'),
              desc: t('features.list.1.desc'),
              icon: <Wand2 className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />,
              delay: 'delay-200'
            },
            {
              title: t('features.list.2.title'),
              desc: t('features.list.2.desc'),
              icon: <Users className="w-8 h-8 text-pink-400 group-hover:text-pink-300" />,
              delay: 'delay-300'
            }
          ].map((feature, i) => (
            <div key={i} className={`relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 group cursor-default hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col items-center text-center opacity-0 animate-fade-in-up ${feature.delay}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/20">
                {feature.icon}
              </div>
              <h3 className="relative text-2xl font-bold mb-4 text-white/90 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="relative text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 container mx-auto px-6 py-32 border-t border-white/10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6">
            <span className="text-blue-400">Quy trình</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('howItWorks.title')}</h2>
          <p className="text-xl text-gray-400">{t('howItWorks.desc')}</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-pink-500/0 -translate-x-1/2"></div>
          
          <div className="space-y-24">
            {[1, 2, 3].map((step, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''} group`}>
                <div className="flex-1 w-full text-center md:text-right group-odd:md:text-right group-even:md:text-left">
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">
                    {t(`howItWorks.steps.${i}.title`)}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {t(`howItWorks.steps.${i}.desc`)}
                  </p>
                </div>
                
                <div className="relative flex-shrink-0 w-20 h-20 rounded-full bg-black border-2 border-white/10 flex items-center justify-center text-3xl font-black text-white/50 group-hover:text-white group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-500 z-10">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">{step}</span>
                </div>
                
                <div className="flex-1 w-full h-48 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group-hover:border-purple-500/30 transition-colors duration-500 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Placeholder for visuals */}
                  {i === 0 && <span className="text-gray-600 font-mono text-sm">Input data...</span>}
                  {i === 1 && <span className="text-purple-500/50 font-mono text-sm animate-pulse">Processing AI...</span>}
                  {i === 2 && <span className="text-green-500/50 font-mono text-sm">Render Complete</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 container mx-auto px-6 py-32">
        <div className="relative rounded-[3rem] overflow-hidden bg-white/[0.02] border border-white/10 p-12 md:p-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 opacity-50 blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
              {t('bottomCta.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12">
              {t('bottomCta.desc')}
            </p>
            <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_10px_60px_rgba(236,72,153,0.6)] transition-all duration-500 group">
              {t('bottomCta.button')}
              <Sparkles className="w-5 h-5 text-purple-600 group-hover:text-pink-500 group-hover:rotate-12 transition-all" />
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
