import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/session";
import { ensureWorkspaceAccess } from "@/lib/auth/workspace";
import { timerStartSchema, timerStopSchema } from "@/lib/validations/domain";
import { startTimer, stopTimer } from "@/lib/services/timer-service";

export async function POST(request: NextRequest) {
  const session = await requireUserSession();
  const body = await request.json();

  if (body.action === "start") {
    const parsed = timerStartSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    await ensureWorkspaceAccess(session.user.id, parsed.data.workspaceId);
    const entry = await startTimer({
      workspaceId: parsed.data.workspaceId,
      userId: session.user.id,
      projectId: parsed.data.projectId,
      description: parsed.data.description
    });
    return NextResponse.json(entry, { status: 201 });
  }

  if (body.action === "stop") {
    const parsed = timerStopSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    await ensureWorkspaceAccess(session.user.id, parsed.data.workspaceId);
    const entry = await stopTimer({ workspaceId: parsed.data.workspaceId, userId: session.user.id });
    return NextResponse.json({ entry });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
