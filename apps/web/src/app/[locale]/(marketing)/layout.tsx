import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function MarketingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="flex flex-col min-h-full flex-1 w-full">
      <Header locale={locale} />
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
