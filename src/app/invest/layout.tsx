
import { Header } from '@/components/header';
import { Footer } from '@/components/landing/footer';

export default function InvestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
