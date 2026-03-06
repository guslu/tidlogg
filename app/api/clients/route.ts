import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { clientSchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const clients = await prisma.client.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const client = await prisma.client.create({
    data: {
      workspaceId,
      name: parsed.data.name,
      color: parsed.data.color ?? null
    }
  });
  return NextResponse.json(client, { status: 201 });
}
