import { prisma } from "@/lib/db/prisma";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns";

export type ReportEntry = {
  startedAt: Date;
  durationSec: number | null;
  isBillable: boolean;
  description: string;
  project: { name: string; billableRate: unknown };
  user: { name: string | null; email: string };
};

export async function loadReportSummary({
  workspaceId,
  from,
  to,
  projectId,
  userId,
  groupBy = "day"
}: {
  workspaceId: string;
  from: Date;
  to: Date;
  projectId?: string;
  userId?: string;
  groupBy?: "day" | "week" | "month";
}) {
  const where = {
    workspaceId,
    startedAt: { gte: from, lte: to },
    endedAt: { not: null as null | Date },
    ...(projectId ? { projectId } : {}),
    ...(userId ? { userId } : {})
  };

  const [entries, totals]: [ReportEntry[], { _sum: { durationSec: number | null } }] = await Promise.all([
    prisma.timeEntry.findMany({
    where,
    select: {
      startedAt: true,
      durationSec: true,
      isBillable: true,
      description: true,
      project: { select: { name: true, billableRate: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { startedAt: "desc" }
    }),
    prisma.timeEntry.aggregate({ where, _sum: { durationSec: true } })
  ]);

  const totalSec = totals._sum.durationSec ?? 0;
  const billableSec = entries
    .filter((entry) => entry.isBillable)
    .reduce((sum, entry) => sum + (entry.durationSec ?? 0), 0);
  const revenue = entries.reduce((sum, entry) => {
    const rate = Number(entry.project.billableRate ?? 0);
    return sum + ((entry.durationSec ?? 0) / 3600) * rate;
  }, 0);

  const grouped = new Map<string, { key: string; durationSec: number }>();
  for (const entry of entries) {
    const d = entry.startedAt;
    const bucketDate =
      groupBy === "month" ? startOfMonth(d) : groupBy === "week" ? startOfWeek(d, { weekStartsOn: 1 }) : startOfDay(d);
    const key = bucketDate.toISOString();
    const current = grouped.get(key);
    if (current) {
      current.durationSec += entry.durationSec ?? 0;
    } else {
      grouped.set(key, { key, durationSec: entry.durationSec ?? 0 });
    }
  }

  return { entries, totalSec, billableSec, revenue, grouped: [...grouped.values()] };
}
