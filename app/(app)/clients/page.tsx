import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { getContrastTextColor } from "@/lib/utils";
import { ClientForm } from "@/components/clients/client-form";

type ClientListItem = {
  id: string;
  name: string;
  color: string | null;
};

const CARD_FALLBACK_BG = "#f1f5f9";

export default async function ClientsPage() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const clients = await prisma.client.findMany({
    where: { workspaceId },
    select: { id: true, name: true, color: true },
    orderBy: { createdAt: "desc" }
  });
  const clientList: ClientListItem[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <ClientForm />
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {!clientList.length && (
          <p className="p-4 text-sm text-slate-600">No clients yet. Add one above.</p>
        )}
        {clientList.map((client) => {
          const bg = client.color && /^#[0-9A-Fa-f]{6}$/.test(client.color) ? client.color : CARD_FALLBACK_BG;
          const textColor = getContrastTextColor(bg);
          return (
            <div
              key={client.id}
              className="border-b border-slate-100 last:border-b-0 px-4 py-3 rounded-none"
              style={{ backgroundColor: bg, color: textColor }}
            >
              <span className="font-medium">{client.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
