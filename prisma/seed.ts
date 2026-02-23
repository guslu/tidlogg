import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@tidlogg.se";
  await prisma.timeEntryTag.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.userActiveWorkspace.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo User",
      passwordHash: await hashPassword("password123")
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      members: { create: { userId: user.id, role: "ADMIN" } }
    }
  });

  await prisma.userActiveWorkspace.create({ data: { userId: user.id, workspaceId: workspace.id } });

  const client = await prisma.client.create({ data: { workspaceId: workspace.id, name: "Nordic Design AB" } });
  const [projectA, projectB] = await Promise.all([
    prisma.project.create({ data: { workspaceId: workspace.id, clientId: client.id, name: "Website Refresh", billableRate: 1100 } }),
    prisma.project.create({ data: { workspaceId: workspace.id, name: "Internal Ops", billableRate: 850 } })
  ]);

  const now = new Date();
  await prisma.timeEntry.createMany({
    data: [
      { workspaceId: workspace.id, userId: user.id, projectId: projectA.id, description: "Design system review", startedAt: new Date(now.getTime() - 5 * 3600_000), endedAt: new Date(now.getTime() - 3 * 3600_000), durationSec: 7200 },
      { workspaceId: workspace.id, userId: user.id, projectId: projectB.id, description: "Weekly planning", startedAt: new Date(now.getTime() - 2 * 3600_000), endedAt: new Date(now.getTime() - 3600_000), durationSec: 3600 }
    ]
  });

  console.log("Seed complete: demo@tidlogg.se / password123");
}

main().finally(async () => prisma.$disconnect());
