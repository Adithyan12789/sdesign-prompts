import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteContent } from '@/lib/data';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer content={content} />
    </div>
  );
}
