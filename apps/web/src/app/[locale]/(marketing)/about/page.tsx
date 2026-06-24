import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <div className="relative font-sans">
      
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 max-w-4xl text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter opacity-0 animate-fade-in-up">
          {t('about.title')}
          <span className="text-purple-500">.</span>
        </h1>
        <h1 className="text-xl md:text-2xl font-medium text-gray-400 mb-16 mx-auto max-w-2xl opacity-0 animate-fade-in-up delay-100">
          {t('about.subtitle')}
        </h1>
        
        <div className="space-y-16 text-lg text-gray-300 leading-relaxed text-left">
          <section className="relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-purple-500/10 backdrop-blur-xl overflow-hidden opacity-0 animate-fade-in-up delay-200 group">
            {/* Animated glowing orb behind card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-700 pointer-events-none"></div>
            
            <p className="text-xl md:text-2xl font-light text-white/90 mb-12 relative z-10 leading-relaxed italic border-l-4 border-purple-500 pl-6 py-2">
              "{t('about.mission_desc')}"
            </p>
            
            <div className="relative w-full h-[350px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 group/img">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-purple-900/20 to-transparent mix-blend-overlay z-10 opacity-60 group-hover/img:opacity-20 transition-opacity duration-700"></div>
              <Image 
                src="/about-demo.jpg" 
                alt="vidForge.AI Studio Demo" 
                fill 
                className="object-cover scale-100 group-hover/img:scale-110 transition-transform duration-[1.5s] ease-out"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
