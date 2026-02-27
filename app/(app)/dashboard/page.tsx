import { redirect } from "next/navigation";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { TimerWidget } from "@/components/dashboard/timer-widget";
import { formatDuration } from "@/lib/utils";

type ProjectOption = { id: string; name: string };
type RunningTimer = {
  id: string;
  startedAt: Date;
  description: string;
  project: { name: string };
} | null;
type TodayEntry = {
  id: string;
  description: string;
  durationSec: number | null;
  project: { name: string };
};

export default async function DashboardPage() {
  const session = await requireUserSession().catch(() => null);
  if (!session) redirect("/auth/login");

  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [projects, running, todayEntries]: [ProjectOption[], RunningTimer, TodayEntry[]] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.timeEntry.findFirst({
      where: { workspaceId, userId: session.user.id, endedAt: null },
      select: { id: true, startedAt: true, description: true, project: { select: { name: true } } },
      orderBy: { startedAt: "desc" }
    }),
    prisma.timeEntry.findMany({
      where: { workspaceId, userId: session.user.id, startedAt: { gte: dayStart } },
      select: { id: true, description: true, durationSec: true, project: { select: { name: true } } },
      orderBy: { startedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <TimerWidget
        workspaceId={workspaceId}
        projects={projects}
        running={
          running
            ? {
                id: running.id,
                startedAt: running.startedAt.toISOString(),
                project: { name: running.project.name },
                description: running.description
              }
            : null
        }
      />
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Today</h2>
        {!todayEntries.length ? (
          <p className="text-sm text-slate-600">No entries yet. Start your first timer above.</p>
        ) : (
          <ul className="space-y-2">
            {todayEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
              >
                <span>
                  {entry.project.name} · {entry.description || "No description"}
                </span>
                <span className="text-sm text-slate-600">
                  {entry.durationSec ? formatDuration(entry.durationSec) : "Running"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
