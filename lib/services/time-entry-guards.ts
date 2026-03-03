import { Prisma } from "@prisma/client";

export async function ensureNoTimeOverlap(
  tx: Prisma.TransactionClient,
  params: { workspaceId: string; userId: string; startedAt: Date; endedAt: Date }
) {
  const conflict = await tx.timeEntry.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      startedAt: { lt: params.endedAt },
      OR: [{ endedAt: null }, { endedAt: { gt: params.startedAt } }]
    },
    select: { id: true }
  });

  if (conflict) {
    throw new Error("Time entry overlaps an existing entry");
  }
}

export async function assertProjectBudget(
  tx: Prisma.TransactionClient,
  params: { projectId: string; incomingDurationSec: number }
) {
  const project = await tx.project.findUnique({
    where: { id: params.projectId },
    select: { budgetMinutes: true }
  });

  if (!project?.budgetMinutes) {
    return;
  }

  const aggregate = await tx.timeEntry.aggregate({
    where: { projectId: params.projectId },
    _sum: { durationSec: true }
  });

  const consumedSeconds = aggregate._sum.durationSec ?? 0;
  const projected = consumedSeconds + params.incomingDurationSec;

  if (projected > project.budgetMinutes * 60) {
    throw new Error("Project budget exceeded");
  }
}
