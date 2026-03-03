import { prisma } from "@/lib/db/prisma";
import { assertProjectBudget, ensureNoTimeOverlap } from "@/lib/services/time-entry-guards";

const now = () => new Date();

export async function startTimer({
  workspaceId,
  userId,
  projectId,
  description
}: {
  workspaceId: string;
  userId: string;
  projectId: string;
  description: string;
}) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id: projectId, workspaceId, archivedAt: null }
    });
    if (!project) throw new Error("Project unavailable");

    const at = now();
    const current = await tx.timeEntry.findFirst({
      where: { workspaceId, userId, endedAt: null },
      orderBy: { startedAt: "desc" }
    });

    if (current) {
      const isIdempotentRetry =
        current.projectId === projectId &&
        current.description === description &&
        at.getTime() - current.startedAt.getTime() <= 10_000;

      if (isIdempotentRetry) {
        return tx.timeEntry.findUniqueOrThrow({
          where: { id: current.id },
          include: { project: true }
        });
      }

      await tx.timeEntry.update({
        where: { id: current.id },
        data: { endedAt: at, durationSec: Math.max(0, Math.floor((at.getTime() - current.startedAt.getTime()) / 1000)) }
      });
    }

    await assertProjectBudget(tx, { projectId, incomingDurationSec: 0 });
    await ensureNoTimeOverlap(tx, {
      workspaceId,
      userId,
      startedAt: at,
      endedAt: new Date(at.getTime() + 1000)
    });

    return tx.timeEntry.create({
      data: {
        workspaceId,
        userId,
        projectId,
        description,
        startedAt: at
      },
      include: { project: true }
    });
  });
}

export async function stopTimer({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  return prisma.$transaction(async (tx) => {
    const running = await tx.timeEntry.findFirst({
      where: { workspaceId, userId, endedAt: null },
      orderBy: { startedAt: "desc" }
    });

    if (!running) return null;
    const at = now();

    return tx.timeEntry.update({
      where: { id: running.id },
      data: {
        endedAt: at,
        durationSec: Math.max(0, Math.floor((at.getTime() - running.startedAt.getTime()) / 1000))
      }
    });
  });
}
