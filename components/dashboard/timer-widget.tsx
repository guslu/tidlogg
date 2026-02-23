"use client";
import { useMemo, useState } from "react";
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
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const elapsed = useMemo(() => {
    if (!running) return "00:00:00";
    return formatDuration(Math.floor((Date.now() - new Date(running.startedAt).getTime()) / 1000));
  }, [running]);

  const call = async (action: "start" | "stop") => {
    setBusy(true);
    const payload = action === "start" ? { action, workspaceId, projectId, description } : { action, workspaceId };
    const res = await fetch("/api/entries/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      push("Timer action failed", "error");
      setBusy(false);
      return;
    }
    push(action === "start" ? "Timer started" : "Timer stopped");
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm text-slate-500">Active timer</div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold text-accent">{elapsed}</div>
          {running ? <p className="text-sm text-slate-600">{running.project.name} · {running.description || "No description"}</p> : <p className="text-sm text-slate-600">No running timer</p>}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={busy || !!running}>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </Select>
        <Input placeholder="What are you working on?" value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy || !!running} />
        {running ? <Button onClick={() => call("stop")} disabled={busy}>Stop</Button> : <Button onClick={() => call("start")} disabled={busy || !projectId}>Start timer</Button>}
      </div>
    </div>
  );
}
