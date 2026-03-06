"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";

const DEFAULT_HEX = "#6366f1";

function normalizeHex(value: string): string {
  const v = value.replace(/^#/, "").slice(0, 6);
  if (/^[0-9A-Fa-f]*$/.test(v)) return "#" + v.padEnd(6, "0");
  return DEFAULT_HEX;
}

export function ClientForm() {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_HEX);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  function handleColorPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setColor(e.target.value);
  }

  function handleHexInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = normalizeHex(e.target.value);
    setColor(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const hex = color.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_HEX;
    setLoading(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color: hex })
    });
    setLoading(false);
    if (!res.ok) return push("Failed to create client", "error");
    push("Client created");
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row md:items-end">
      <Input
        required
        placeholder="Client name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Color</label>
        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
          <input
            type="color"
            value={color}
            onChange={handleColorPickerChange}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            title="Pick color"
          />
          <input
            type="text"
            value={color}
            onChange={handleHexInputChange}
            className="w-20 rounded px-2 py-1 text-sm font-mono tabular-nums"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </div>
      <Button disabled={loading}>{loading ? "Saving..." : "Add client"}</Button>
    </form>
  );
}
