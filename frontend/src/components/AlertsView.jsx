import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertOctagon,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { fetchAlerts, updateAlertStatus, deleteAlert, clearAllData } from '../utils/api';

export default function AlertsView({ onSelectAlert, onAlertsUpdated }) {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAlerts = async (targetPage = page) => {
    setIsLoading(true);
    try {
      const data = await fetchAlerts({
        page: targetPage,
        perPage,
        severity,
        status,
        search,
      });
      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(1);
  }, [severity, status, perPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAlerts(1);
  };

  const handleStatusChange = async (alertId, newStatus) => {
    setUpdatingId(alertId);
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
      if (onAlertsUpdated) onAlertsUpdated();
    } catch (err) {
      alert(`Error updating alert status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm(`Delete alert #${alertId}?`)) return;
    try {
      await deleteAlert(alertId);
      loadAlerts(page);
      if (onAlertsUpdated) onAlertsUpdated();
    } catch (err) {
      alert(`Failed to delete alert: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("CAUTION: This will wipe all recorded alerts and packet events from the SQLite database. Continue?")) return;
    try {
      await clearAllData();
      loadAlerts(1);
      if (onAlertsUpdated) onAlertsUpdated();
    } catch (err) {
      alert(`Failed to clear database: ${err.message}`);
    }
  };

  const sevBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(255,0,85,0.4)] font-black';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700 font-semibold';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Triage Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-orbitron font-extrabold tracking-wide text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            INCIDENT DETECTION & ALERT TRIAGE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Total Threats Registered: <strong className="text-cyan-400 font-orbitron">{total}</strong> incident records logged in SQLite
          </p>
        </div>

        {/* Action Buttons: Export & Clear */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/alerts/export/csv"
            download
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-300 transition-all shadow-sm"
            title="Download Alerts as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV Export</span>
          </a>

          <a
            href="/alerts/export/json"
            download
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
            title="Download Alerts as JSON"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>JSON Export</span>
          </a>

          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 hover:border-red-500 text-red-300 transition-all shadow-sm"
            title="Clear all alerts and events"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Wipe Database</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-400/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, rule name, or packet signature..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
          />
        </form>

        {/* Severity & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs font-chakra font-bold text-slate-400">Severity:</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-slate-900 text-white">ALL</option>
              <option value="Critical" className="bg-slate-900 text-red-400">Critical</option>
              <option value="High" className="bg-slate-900 text-amber-400">High</option>
              <option value="Medium" className="bg-slate-900 text-cyan-400">Medium</option>
              <option value="Low" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs font-chakra font-bold text-slate-400">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-xs font-mono text-purple-300 focus:outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-slate-900 text-white">ALL</option>
              <option value="Open" className="bg-slate-900 text-rose-300">Open</option>
              <option value="Investigating" className="bg-slate-900 text-purple-300">Investigating</option>
              <option value="Resolved" className="bg-slate-900 text-emerald-300">Resolved</option>
              <option value="False Positive" className="bg-slate-900 text-slate-400">False Positive</option>
            </select>
          </div>

          <button
            onClick={() => loadAlerts(page)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-all"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-chakra uppercase tracking-wider text-xs font-bold">
                <th className="py-3.5 px-4">INCIDENT ID</th>
                <th className="py-3.5 px-4">TIMESTAMP</th>
                <th className="py-3.5 px-4">SEVERITY</th>
                <th className="py-3.5 px-4">THREAT SIGNATURE</th>
                <th className="py-3.5 px-4">ATTACKER IP</th>
                <th className="py-3.5 px-4">TARGET IP:PORT</th>
                <th className="py-3.5 px-4">EVIDENCE ARTIFACT</th>
                <th className="py-3.5 px-4">TRIAGE STATUS</th>
                <th className="py-3.5 px-4 text-right">FORENSICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-cyan-400 mb-3" />
                    Querying intrusion events from SQLite...
                  </td>
                </tr>
              ) : alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-cyan-950/15 transition-colors group">
                    <td className="py-3.5 px-4 font-orbitron font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                      #{alert.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {alert.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-chakra font-bold border tracking-wider ${sevBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate group-hover:text-cyan-200 transition-colors">
                      {alert.rule_name}
                      <div className="text-[10px] font-normal text-slate-500 font-mono truncate mt-0.5">
                        {alert.pcap_source || 'Live Capture Stream'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold whitespace-nowrap">
                      {alert.source_ip || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {alert.dest_ip}{alert.port ? `:${alert.port}` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                      {alert.evidence || alert.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={alert.status}
                        disabled={updatingId === alert.id}
                        onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                        className={`text-[11px] font-mono font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer transition-all ${
                          alert.status === 'Resolved'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : alert.status === 'Investigating'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-700 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                            : alert.status === 'False Positive'
                            ? 'bg-slate-900 text-slate-400 border-slate-700'
                            : 'bg-rose-950/60 text-rose-300 border-rose-700 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                        }`}
                      >
                        <option value="Open" className="bg-slate-900 text-rose-300">Open</option>
                        <option value="Investigating" className="bg-slate-900 text-purple-300">Investigating</option>
                        <option value="Resolved" className="bg-slate-900 text-emerald-300">Resolved</option>
                        <option value="False Positive" className="bg-slate-900 text-slate-400">False Positive</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectAlert(alert)}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all shadow-sm flex items-center gap-1 text-xs font-chakra font-bold"
                          title="View Forensic Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Forensics</span>
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/40 transition-all"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500 font-mono">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No threat alerts matching query criteria. Perimeter is uncompromised.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/70 border-t border-slate-800 text-xs font-mono text-slate-400 gap-3">
          <div>
            Showing Page <strong className="text-white font-orbitron">{page}</strong> of <strong className="text-white font-orbitron">{totalPages}</strong> ({total} total incidents)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => page > 1 && loadAlerts(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-slate-300 font-orbitron font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => page < totalPages && loadAlerts(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
