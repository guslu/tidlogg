import { redirect } from "next/navigation";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { TimerWidget } from "@/components/dashboard/timer-widget";
import { ClientBadge } from "@/components/clients/client-badge";
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
  isBillable: boolean;
  project: { name: string; client: { name: string; color: string | null } | null };
};
type WeekEntry = {
  durationSec: number | null;
  isBillable: boolean;
  project: { name: string };
};

export default async function DashboardPage() {
  const session = await requireUserSession().catch(() => null);
  if (!session) redirect("/auth/login");

  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(dayStart);
  const day = weekStart.getDay(); // 0 (Sun) - 6 (Sat), we want Monday as start
  const diffFromMonday = (day + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diffFromMonday);

  const [projects, running, todayEntries, weekEntries]: [ProjectOption[], RunningTimer, TodayEntry[], WeekEntry[]] =
    await Promise.all([
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
        select: {
          id: true,
          description: true,
          durationSec: true,
          isBillable: true,
          project: { select: { name: true, client: { select: { name: true, color: true } } } }
        },
        orderBy: { startedAt: "desc" }
      }),
      prisma.timeEntry.findMany({
        where: {
          workspaceId,
          userId: session.user.id,
          startedAt: { gte: weekStart },
          endedAt: { not: null }
        },
        select: {
          durationSec: true,
          isBillable: true,
          project: { select: { name: true } }
        }
      })
    ]);

  const totalSecondsToday = todayEntries.reduce((sum, entry) => sum + (entry.durationSec ?? 0), 0);
  const billableSecondsToday = todayEntries.reduce(
    (sum, entry) => sum + (entry.isBillable ? entry.durationSec ?? 0 : 0),
    0
  );

  const totalSecondsThisWeek = weekEntries.reduce((sum, entry) => sum + (entry.durationSec ?? 0), 0);

  const projectDurations = new Map<string, number>();
  for (const entry of weekEntries) {
    const key = entry.project.name;
    projectDurations.set(key, (projectDurations.get(key) ?? 0) + (entry.durationSec ?? 0));
  }
  const topProjectsThisWeek = [...projectDurations.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const billableShareToday =
    totalSecondsToday > 0 ? Math.round((billableSecondsToday / totalSecondsToday) * 100) : 0;

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
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-layout-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today</p>
          <p className="mt-2 text-2xl font-semibold">{formatDuration(totalSecondsToday)}</p>
          <p className="mt-1 text-xs text-slate-500">Your tracked time so far today.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-layout-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Billable today
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatDuration(billableSecondsToday)}</p>
          <p className="mt-1 text-xs text-slate-500">{billableShareToday}% of today&apos;s time</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-layout-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            This week (Mon–today)
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatDuration(totalSecondsThisWeek)}</p>
          <p className="mt-1 text-xs text-slate-500">Personal total across all projects.</p>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-layout-card p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Today</h2>
          <p className="text-sm text-slate-600">
            Total hours: {totalSecondsToday ? formatDuration(totalSecondsToday) : "0h 00m"}
          </p>
        </div>
        {!todayEntries.length ? (
          <p className="text-sm text-slate-600">No entries yet. Start your first timer above.</p>
        ) : (
          <ul className="space-y-2">
            {todayEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {entry.project.client ? (
                    <ClientBadge name={entry.project.client.name} color={entry.project.client.color} />
                  ) : null}
                  <span className="truncate">
                    {entry.project.name}
                    {entry.description ? ` · ${entry.description}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-slate-600">
                  {entry.durationSec ? formatDuration(entry.durationSec) : "Running"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-layout-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Top projects this week</h2>
        {!topProjectsThisWeek.length ? (
          <p className="text-sm text-slate-600">No tracked time yet this week.</p>
        ) : (
          <ul className="space-y-2">
            {topProjectsThisWeek.map(([name, duration]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
              >
                <span className="truncate text-sm">{name}</span>
                <span className="text-sm font-medium text-slate-700">
                  {formatDuration(duration)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
