import { requireUserSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function SettingsPage() {
  const session = await requireUserSession();
  const memberships = await prisma.workspaceMember.findMany({ where: { userId: session.user.id }, include: { workspace: true } });

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Settings</h1><div className="rounded-xl border bg-white p-4"><h2 className="mb-2 font-medium">Workspaces</h2><ul className="space-y-2">{memberships.map((m) => <li key={m.id} className="flex justify-between"><span>{m.workspace.name}</span><span className="text-sm text-slate-600">{m.role}</span></li>)}</ul></div></div>;
}
