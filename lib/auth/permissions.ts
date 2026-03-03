import { WorkspaceRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function assertWorkspaceMembership(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { workspaceId: true, role: true }
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  return membership;
}

export async function assertWorkspaceAdmin(userId: string, workspaceId: string) {
  const membership = await assertWorkspaceMembership(userId, workspaceId);
  if (membership.role !== WorkspaceRole.ADMIN) {
    throw new Error("Forbidden");
  }
  return membership;
}

export async function assertProjectInWorkspace(projectId: string, workspaceId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId, archivedAt: null },
    select: { id: true, budgetMinutes: true }
  });

  if (!project) {
    throw new Error("Project unavailable");
  }

  return project;
}

export async function assertTagsInWorkspace(tagIds: string[], workspaceId: string) {
  if (!tagIds.length) return;
  const tagCount = await prisma.tag.count({ where: { workspaceId, id: { in: tagIds } } });
  if (tagCount !== new Set(tagIds).size) {
    throw new Error("One or more tags are invalid for this workspace");
  }
}

export async function assertClientInWorkspace(clientId: string, workspaceId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, workspaceId, archivedAt: null },
    select: { id: true }
  });

  if (!client) {
    throw new Error("Client unavailable");
  }
}
