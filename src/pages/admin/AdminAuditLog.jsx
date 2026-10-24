import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, Filter, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { sounds } from '../../audio/sounds';

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLog();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const s = search.toLowerCase();
    return (
      log.actionType.toLowerCase().includes(s) ||
      log.targetId.toLowerCase().includes(s) ||
      log.administratorId.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-metallic-gold/15 pb-4">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-softwhite uppercase">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-0.5">
            Immutable log of all problem launches, constraint reveals, timer operations, and rule approvals.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            fetchLogs();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-deepspace border border-metallic-gold/30 text-metallic-bright font-mono text-xs hover:border-metallic-gold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedsilver" />
        <input
          type="text"
          placeholder="Filter by action, target, or admin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-deepspace border border-metallic-gold/25 focus:border-metallic-gold text-xs font-mono text-softwhite focus:outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-deepspace border border-metallic-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian/80 border-b border-metallic-gold/15 text-metallic-gold uppercase">
              <tr>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Metadata / Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.actionId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-metallic-bright">
                    {log.actionType}
                  </td>
                  <td className="py-3 px-4 text-softwhite font-medium">
                    {log.targetId}
                  </td>
                  <td className="py-3 px-4 text-mutedsilver text-[11px]">
                    {log.administratorId}
                  </td>
                  <td className="py-3 px-4 text-mutedsilver max-w-xs truncate text-[11px]">
                    {JSON.stringify(log.safeMetadata || {})}
                  </td>
                  <td className="py-3 px-4 text-right text-mutedsilver text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
