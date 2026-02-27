import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { projectSchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";

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

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const project = await prisma.project.create({
    data: {
      workspaceId,
      name: parsed.data.name,
      clientId: parsed.data.clientId,
      billableRate: parsed.data.billableRate
    }
  });

  return NextResponse.json(project, { status: 201 });
}
