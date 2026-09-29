import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-x-clip bg-bg-black">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar showLogo={false} />
        <DashboardMobileNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
