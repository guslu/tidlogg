import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { ProjectForm } from "@/components/projects/project-form";
import { formatDuration } from "@/lib/utils";

type ProjectItem = {
  id: string;
  name: string;
  budgetMinutes: number | null;
  client: { name: string } | null;
};

type ClientOption = {
  id: string;
  name: string;
};

export default async function ProjectsPage() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);

  const [projects, clients, durations]: [ProjectItem[], ClientOption[], { projectId: string; _sum: { durationSec: number | null } }[]] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true, budgetMinutes: true, client: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({
      where: { workspaceId, archivedAt: null },
      select: { id: true, name: true }
    }),
    prisma.timeEntry.groupBy({
      by: ["projectId"],
      where: { workspaceId, endedAt: { not: null } },
      _sum: { durationSec: true }
    })
  ]);

  const durationMap = new Map(durations.map((entry) => [entry.projectId, entry._sum.durationSec ?? 0]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <ProjectForm clients={clients} />
      <div className="rounded-xl border bg-white">
        {!projects.length && <p className="p-4 text-sm text-slate-600">No projects yet.</p>}
        {projects.map((project) => (
          <div key={project.id} className="grid gap-1 border-b p-3 last:border-b-0 md:grid-cols-3 md:items-center">
            <span>{project.name}</span>
            <span className="text-sm text-slate-600">{project.client?.name ?? "No client"}</span>
            <span className="text-sm text-slate-600">
              {formatDuration(durationMap.get(project.id) ?? 0)} tracked
              {project.budgetMinutes ? ` / ${formatDuration(project.budgetMinutes * 60)} budget` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
