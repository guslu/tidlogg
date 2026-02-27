import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: `${parsed.data.name.split(" ")[0]}'s Workspace`,
      members: { create: { userId: user.id, role: "ADMIN" } }
    }
  });

  await prisma.userActiveWorkspace.create({ data: { userId: user.id, workspaceId: workspace.id } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
