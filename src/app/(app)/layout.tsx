import { Sidebar } from "@/components/navigation/sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { MobileHeader } from "@/components/navigation/mobile-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 overflow-x-hidden">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
