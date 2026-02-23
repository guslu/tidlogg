import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { workspaceSwitchSchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireUserSession();
  const context = await getUserWorkspaceContext(session.user.id);
  return NextResponse.json(context);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const body = await request.json();
  const parsed = workspaceSwitchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid workspace" }, { status: 422 });

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: parsed.data.workspaceId, userId: session.user.id } }
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.userActiveWorkspace.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, workspaceId: parsed.data.workspaceId },
    update: { workspaceId: parsed.data.workspaceId }
  });

  return NextResponse.json({ ok: true });
}
