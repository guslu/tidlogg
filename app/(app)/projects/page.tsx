import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { ProjectForm } from "@/components/projects/project-form";

export default async function ProjectsPage() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId }, include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ where: { workspaceId, archivedAt: null } })
  ]);

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Projects</h1><ProjectForm clients={clients} /><div className="rounded-xl border bg-white">{projects.map((project) => <div key={project.id} className="flex justify-between border-b p-3 last:border-b-0"><span>{project.name}</span><span className="text-sm text-slate-600">{project.client?.name ?? "No client"}</span></div>)}</div></div>;
}
