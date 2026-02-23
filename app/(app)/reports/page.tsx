import { subDays } from "date-fns";
import { requireUserSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/auth/workspace";
import { loadReportSummary } from "@/lib/services/report-service";
import { formatCurrency, formatDuration } from "@/lib/utils";

export default async function ReportsPage() {
  const session = await requireUserSession();
  const { workspaceId } = await getUserWorkspaceContext(session.user.id);
  const from = subDays(new Date(), 30);
  const to = new Date();
  const report = await loadReportSummary({ workspaceId, from, to });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports (last 30 days)</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Total time</p><p className="text-2xl font-semibold">{formatDuration(report.totalSec)}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Billable</p><p className="text-2xl font-semibold">{formatDuration(report.billableSec)}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Revenue estimate</p><p className="text-2xl font-semibold">{formatCurrency(report.revenue)}</p></div>
      </div>
      <a className="inline-flex rounded-md bg-accent px-4 py-2 text-white" href={`/api/reports/export?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`}>Export CSV</a>
    </div>
  );
}
