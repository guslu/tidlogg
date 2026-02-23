import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/providers/toast-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen md:flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
