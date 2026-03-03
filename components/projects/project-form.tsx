"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";

export function ProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [rate, setRate] = useState("");
  const [budgetMinutes, setBudgetMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        clientId: clientId || null,
        billableRate: rate ? Number(rate) : null,
        budgetMinutes: budgetMinutes ? Number(budgetMinutes) : null
      })
    });
    setLoading(false);
    if (!res.ok) return push("Failed to create project", "error");
    push("Project created");
    setName("");
    setClientId("");
    setRate("");
    setBudgetMinutes("");
    router.refresh();
  }

  return <form onSubmit={submit} className="grid gap-2 md:grid-cols-5"><Input required placeholder="New project" value={name} onChange={(e) => setName(e.target.value)} /><Select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">No client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Input placeholder="Rate SEK/h" value={rate} onChange={(e) => setRate(e.target.value)} /><Input placeholder="Budget (minutes)" value={budgetMinutes} onChange={(e) => setBudgetMinutes(e.target.value)} /><Button disabled={loading}>{loading ? "Saving..." : "Create"}</Button></form>;
}
