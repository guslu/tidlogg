"use client";
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
    <aside className="w-full border-r border-slate-200 bg-white p-4 md:w-64">
      <div className="mb-8 text-xl font-semibold tracking-tight">Tidlogg</div>
      <nav className="space-y-1">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={cn("block rounded-md px-3 py-2 text-sm", pathname.startsWith(href) ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-100")}>{label}</Link>
        ))}
      </nav>
    </aside>
  );
}
