"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";

export function TimerWidget({
  workspaceId,
  projects,
  running
}: {
  workspaceId: string;
  projects: { id: string; name: string }[];
  running?: { id: string; startedAt: string; project: { name: string }; description: string } | null;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [now, setNow] = useState(Date.now());
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (projectId || !projects.length) return;
    setProjectId(projects[0].id);
  }, [projects, projectId]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = useMemo(() => {
    if (!running) return "00:00:00";
    return formatDuration(Math.max(0, Math.floor((now - new Date(running.startedAt).getTime()) / 1000)));
  }, [now, running]);

  const call = async (action: "start" | "stop") => {
    setBusy(true);
    const payload =
      action === "start"
        ? { action, workspaceId, projectId, description }
        : { action, workspaceId };

    try {
      const res = await fetch("/api/entries/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        push(payload.error ?? "Timer action failed", "error");
        return;
      }

      push(action === "start" ? "Timer started" : "Timer stopped");
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-layout-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Active timer
          </div>
          <div className="mt-2 text-4xl font-semibold text-accent">{elapsed}</div>
          {running ? (
            <p className="mt-1 text-sm text-slate-600">
              {running.project.name} · {running.description || "No description"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">No running timer</p>
          )}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,2fr),minmax(0,3fr),auto]">
        <Select
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          disabled={busy || isPending || Boolean(running)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={busy || isPending || Boolean(running)}
        />
        {running ? (
          <Button onClick={() => call("stop")} disabled={busy || isPending}>
            Stop
          </Button>
        ) : (
          <Button onClick={() => call("start")} disabled={busy || isPending || !projectId}>
            {projects.length ? "Start timer" : "Create a project first"}
          </Button>
        )}
      </div>
    </div>
  );
}
