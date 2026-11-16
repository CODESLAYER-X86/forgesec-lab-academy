import { getAdminAuditLogs } from "@/modules/admin/service";
import { requireFullAdmin } from "@/modules/auth/session";

export const metadata = {
  title: "Audit Logs | FORGESEC Admin",
};

export default async function AdminAuditLogsPage() {
  await requireFullAdmin();
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Compliance & Security
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">Audit Logs</h1>
        <p className="text-sm text-[#AAB4BE]">
          Immutable record of administrative role changes, quiz updates, and assignment publications.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#262F38] uppercase tracking-wider text-[#7B8794]">
            <tr>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262F38]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#7B8794]">
                  No audit events logged yet.
                </td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#202831]/60 transition-colors">
                  <td className="px-4 py-3 font-mono tabular-nums text-[#AAB4BE] whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-[#F3F4F6]">{entry.actorEmail}</td>
                  <td className="px-4 py-3 font-mono text-[#A3E635]">{entry.action}</td>
                  <td className="px-4 py-3 font-mono text-[#AAB4BE]">
                    {entry.targetType}:{entry.targetId}
                  </td>
                  <td className="px-4 py-3 font-mono text-[#7B8794]">
                    {JSON.stringify(entry.details)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
