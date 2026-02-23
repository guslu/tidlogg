"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl border bg-white p-6">
      <h1 className="mb-4 text-2xl font-semibold">Log in to Tidlogg</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button disabled={loading} className="w-full">{loading ? "Logging in..." : "Log in"}</Button>
      </form>
      <p className="mt-3 text-sm text-slate-600">New here? <a href="/auth/register" className="text-accent underline">Create account</a></p>
    </div>
  );
}
