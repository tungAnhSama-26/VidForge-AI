import Image from 'next/image';
import { Link } from '@/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Layers, Info, Phone, Home, LogIn, Zap, Workflow, LayoutDashboard, User, LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import UserDropdown from './UserDropdown';

export default async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/60 border-b border-white/10 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:scale-105 transition-transform duration-300 shrink-0">
        <Image src="/logo.jpg" alt="VidForge AI Logo" width={80} height={80} className="rounded-xl sm:rounded-2xl object-cover shadow-lg shadow-purple-500/50 w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20" />
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">VidForge<span className="text-purple-400">.AI</span></span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-12 text-sm font-medium text-gray-300">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
          <Home className="w-4 h-4" />
          {t('nav.home')}
        </Link>
        <Link href="/#features" className="hover:text-white transition-colors flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {t('nav.features')}
        </Link>
        <Link href="/#how-it-works" className="hover:text-white transition-colors flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          {t('nav.howItWorks')}
        </Link>
        <Link href="/about" className="hover:text-white transition-colors flex items-center gap-2">
          <Info className="w-4 h-4" />
          {t('nav.about')}
        </Link>
        <Link href="/#contact" className="hover:text-white transition-colors flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {t('nav.contact')}
        </Link>
      </nav>
      
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <LanguageSwitcher locale={locale} />
        
        {session ? (
          <UserDropdown user={session.user} mode="header" />
        ) : (
          <>
            <Link href="/login" className="text-sm font-semibold hover:text-purple-400 transition-colors flex items-center gap-1 sm:gap-1.5 group">
              <LogIn className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </Link>
            <Link href="/register" className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-black text-xs sm:text-sm font-bold hover:scale-105 hover:bg-purple-50 transition-all flex items-center gap-1 sm:gap-1.5 group shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              <span className="hidden sm:inline">{t('nav.start')}</span>
              <span className="sm:hidden">Start</span>
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </Link>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
