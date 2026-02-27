import { prisma } from "@/lib/db/prisma";

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
  userId
}: {
  workspaceId: string;
  from: Date;
  to: Date;
  projectId?: string;
  userId?: string;
}) {
  const where = {
    workspaceId,
    startedAt: { gte: from, lte: to },
    endedAt: { not: null as null | Date },
    ...(projectId ? { projectId } : {}),
    ...(userId ? { userId } : {})
  };

  const entries: ReportEntry[] = await prisma.timeEntry.findMany({
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
  });

  const totalSec = entries.reduce((sum, entry) => sum + (entry.durationSec ?? 0), 0);
  const billableSec = entries
    .filter((entry) => entry.isBillable)
    .reduce((sum, entry) => sum + (entry.durationSec ?? 0), 0);
  const revenue = entries.reduce((sum, entry) => {
    const rate = Number(entry.project.billableRate ?? 0);
    return sum + ((entry.durationSec ?? 0) / 3600) * rate;
  }, 0);

  return { entries, totalSec, billableSec, revenue };
}
