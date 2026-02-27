"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";

export function ClientForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setLoading(false);
    if (!res.ok) return push("Failed to create client", "error");
    push("Client created");
    window.location.reload();
  }

  return <form onSubmit={submit} className="flex gap-2"><Input required placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} /><Button disabled={loading}>{loading ? "Saving..." : "Add client"}</Button></form>;
}
