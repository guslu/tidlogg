import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { ClientForm } from "@/components/clients/client-form";

export default async function ClientsPage() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const clients = await prisma.client.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } });

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Clients</h1><ClientForm /><div className="rounded-xl border bg-white">{clients.map((client) => <div key={client.id} className="border-b p-3 last:border-b-0">{client.name}</div>)}</div></div>;
}
