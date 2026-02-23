import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { tagSchema } from "@/lib/validations/domain";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const tags = await prisma.tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const body = await request.json();
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const tag = await prisma.tag.create({
    data: { workspaceId, name: parsed.data.name, color: parsed.data.color ?? "#4F7C82" }
  });
  return NextResponse.json(tag, { status: 201 });
}
