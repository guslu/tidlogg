import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireUserSession();
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  return NextResponse.json(
    memberships.map((membership) => ({
      workspaceId: membership.workspaceId,
      name: membership.workspace.name,
      role: membership.role
    }))
  );
}
