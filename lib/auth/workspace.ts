import { prisma } from "@/lib/db/prisma";

export async function getUserWorkspaceContext(userId: string, requestedWorkspaceId?: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true }
  });

  if (!memberships.length) {
    const workspace = await prisma.workspace.create({
      data: {
        name: "My Workspace",
        members: { create: { userId, role: "ADMIN" } }
      }
    });
    await prisma.userActiveWorkspace.upsert({
      where: { userId },
      create: { userId, workspaceId: workspace.id },
      update: { workspaceId: workspace.id }
    });
    return { workspaceId: workspace.id, role: "ADMIN" as const };
  }

  if (requestedWorkspaceId) {
    const membership = memberships.find((item) => item.workspaceId === requestedWorkspaceId);
    if (membership) {
      return { workspaceId: membership.workspaceId, role: membership.role };
    }
  }

  const active = await prisma.userActiveWorkspace.findUnique({ where: { userId } });
  const activeMembership = memberships.find((item) => item.workspaceId === active?.workspaceId);
  const fallback = activeMembership ?? memberships[0];

  await prisma.userActiveWorkspace.upsert({
    where: { userId },
    create: { userId, workspaceId: fallback.workspaceId },
    update: { workspaceId: fallback.workspaceId }
  });

  return { workspaceId: fallback.workspaceId, role: fallback.role };
}

export async function ensureWorkspaceAccess(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });
  if (!membership) throw new Error("Forbidden");
  return membership;
}
