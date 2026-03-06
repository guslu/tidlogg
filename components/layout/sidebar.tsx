"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  ["/dashboard", "Dashboard"],
  ["/entries", "Entries"],
  ["/projects", "Projects"],
  ["/clients", "Clients"],
  ["/reports", "Reports"],
  ["/settings", "Settings"]
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-r bg-layout-sidebar text-slate-100 md:w-64">
      <div className="flex items-center gap-3 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/logo.png" alt="Tidlogg logo" fill priority sizes="32px" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Tidlogg</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map(([href, label]) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-slate-200 hover:bg-layout-sidebar-muted/80 hover:text-white"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
