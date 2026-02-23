"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      setError("Could not create account");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl border bg-white p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create your Tidlogg account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button disabled={loading} className="w-full">{loading ? "Creating..." : "Create account"}</Button>
      </form>
    </div>
  );
}
