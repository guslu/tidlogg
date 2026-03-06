import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#14b8a6"
];

const prisma = new PrismaClient();

async function main() {
  const withoutColor = await prisma.client.findMany({
    where: { color: null },
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });
  if (!withoutColor.length) {
    console.log("No clients without a color.");
    return;
  }
  for (let i = 0; i < withoutColor.length; i++) {
    const color = PALETTE[i % PALETTE.length];
    await prisma.client.update({
      where: { id: withoutColor[i].id },
      data: { color }
    });
  }
  console.log(`Assigned colors to ${withoutColor.length} client(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
