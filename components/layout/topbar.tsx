"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="flex items-center justify-end border-b border-slate-200 bg-white p-3">
      <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign out</Button>
    </header>
  );
}
