"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="flex items-center justify-end border-b border-slate-200 bg-layout-background/60 px-6 py-4">
      <Button
        variant="ghost"
        className="rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
      >
        Sign out
      </Button>
    </header>
  );
}
