import { NextRequest, NextResponse } from "next/server";
import { parse } from "json2csv";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { reportQuerySchema } from "@/lib/validations/domain";
import { loadReportSummary } from "@/lib/services/report-service";

export async function GET(request: NextRequest) {
  const session = await requireUserSession();
  const { searchParams } = new URL(request.url);

  const parsed = reportQuerySchema.safeParse({
    workspaceId: searchParams.get("workspaceId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    projectId: searchParams.get("projectId") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
    groupBy: searchParams.get("groupBy") ?? "day"
  });

  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const context = await getUserWorkspaceContext(session.user.id, parsed.data.workspaceId);
  if (context.role !== "ADMIN") parsed.data.userId = session.user.id;

  const report = await loadReportSummary(parsed.data);

  const safeCell = (value: string) => {
    if (/^[=+\-@]/.test(value)) {
      return `'${value}`;
    }
    return value;
  };

  const csv = parse(
    report.entries.map((entry) => ({
      date: entry.startedAt.toISOString(),
      user: safeCell(entry.user.name ?? entry.user.email),
      project: safeCell(entry.project.name),
      description: safeCell(entry.description),
      durationSec: entry.durationSec ?? 0
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="tidlogg-report.csv"'
    }
  });
}
