import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { projectSchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";
import { assertClientInWorkspace } from "@/lib/auth/permissions";
import { apiError } from "@/lib/api";

export async function GET() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: {
      client: true,
      _count: { select: { timeEntries: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const durations = await prisma.timeEntry.groupBy({
    by: ["projectId"],
    where: { workspaceId, endedAt: { not: null } },
    _sum: { durationSec: true }
  });

  const durationMap = new Map(durations.map((entry) => [entry.projectId, entry._sum.durationSec ?? 0]));

  const withTotals = projects.map((project) => ({
    ...project,
    totalDurationSec: durationMap.get(project.id) ?? 0
  }));

  return NextResponse.json(withTotals);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  try {
    if (parsed.data.clientId) {
      await assertClientInWorkspace(parsed.data.clientId, workspaceId);
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        clientId: parsed.data.clientId,
        billableRate: parsed.data.billableRate,
        budgetMinutes: parsed.data.budgetMinutes
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to create project", 400);
  }
}
