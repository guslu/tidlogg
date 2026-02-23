import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { entrySchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireUserSession();
  const { workspaceId, role } = await getUserWorkspaceContext(session.user.id);

  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId, ...(role === "ADMIN" ? {} : { userId: session.user.id }) },
    include: { project: true, tags: { include: { tag: true } }, user: true },
    orderBy: { startedAt: "desc" },
    take: 100
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const body = await request.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { workspaceId } = await getUserWorkspaceContext(session.user.id, parsed.data.workspaceId);
  const durationSec = Math.max(0, Math.floor((parsed.data.endedAt.getTime() - parsed.data.startedAt.getTime()) / 1000));

  const entry = await prisma.timeEntry.create({
    data: {
      workspaceId,
      userId: session.user.id,
      projectId: parsed.data.projectId,
      description: parsed.data.description,
      startedAt: parsed.data.startedAt,
      endedAt: parsed.data.endedAt,
      durationSec,
      tags: {
        create: parsed.data.tagIds.map((tagId) => ({ tagId }))
      }
    }
  });

  return NextResponse.json(entry, { status: 201 });
}
