import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { formatDuration } from "@/lib/utils";

type EntryItem = {
  id: string;
  description: string;
  durationSec: number | null;
  project: { name: string };
  user: { name: string | null; email: string };
};

export default async function EntriesPage() {
  const session = await requireUserSession();
  const { workspaceId, role } = await getUserWorkspaceContext(session.user.id);

  const entries: EntryItem[] = await prisma.timeEntry.findMany({
    where: { workspaceId, ...(role === "ADMIN" ? {} : { userId: session.user.id }) },
    select: {
      id: true,
      description: true,
      durationSec: true,
      project: { select: { name: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { startedAt: "desc" },
    take: 200
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Entries</h1>
      <div className="rounded-xl border bg-white">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid grid-cols-1 gap-1 border-b p-3 text-sm last:border-b-0 md:grid-cols-4"
          >
            <span>{entry.project.name}</span>
            <span>{entry.description || "No description"}</span>
            <span>{entry.user.name ?? entry.user.email}</span>
            <span className="text-slate-600">
              {entry.durationSec ? formatDuration(entry.durationSec) : "Running"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
