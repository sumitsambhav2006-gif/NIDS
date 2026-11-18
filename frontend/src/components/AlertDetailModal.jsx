import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Radio,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { updateAlertStatus } from '../utils/api';

export default function AlertDetailModal({ alert, onClose, onStatusUpdated }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(alert.status || 'Open');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!alert) return null;

  const iptablesRule = alert.source_ip 
    ? `sudo iptables -A INPUT -s ${alert.source_ip} -j DROP` 
    : 'sudo iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT';

  const handleCopyIptables = () => {
    navigator.clipboard.writeText(iptablesRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateAlertStatus(alert.id, newStatus);
      setStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const sevBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_12px_rgba(255,0,85,0.4)]';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#080d1a] border border-red-500/40 rounded-3xl shadow-[0_0_50px_rgba(255,0,85,0.3)] p-7 max-h-[92vh] overflow-y-auto tech-corner-box">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(255,0,85,0.4)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-chakra font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${sevBadge(alert.severity)}`}>
                  {alert.severity} SEVERITY
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  INCIDENT #{alert.id}
                </span>
              </div>
              <h3 className="text-lg font-orbitron font-bold text-white mt-1">
                {alert.rule_name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          
          {/* Key Host Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Timestamp</span>
              <span className="text-xs font-bold font-mono text-slate-300 mt-0.5 block">{alert.timestamp}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Protocol</span>
              <span className="text-xs font-bold font-mono text-cyan-300 mt-0.5 block">{alert.protocol || 'TCP'}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Target Port</span>
              <span className="text-xs font-bold font-orbitron text-rose-400 mt-0.5 block">:{alert.port || 'N/A'}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Capture Source</span>
              <span className="text-xs font-bold font-mono text-slate-300 truncate mt-0.5 block">{alert.pcap_source || 'Live Capture Stream'}</span>
            </div>
          </div>

          {/* Host Flow */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] text-red-400 block font-bold">ATTACKER HOST</span>
              <span className="text-white text-sm font-bold mt-0.5 block">{alert.source_ip || 'Unknown Attacker'}</span>
            </div>
            <div className="text-red-400 font-bold text-lg px-3">
              ➔ INTRUSION ➔
            </div>
            <div className="text-right">
              <span className="text-[10px] text-cyan-400 block font-bold">VICTIM HOST</span>
              <span className="text-white text-sm font-bold mt-0.5 block">{alert.dest_ip}:{alert.port || '0'}</span>
            </div>
          </div>

          {/* Rule Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-chakra font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              HEURISTIC DETECTION DESCRIPTION
            </label>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 font-sans text-xs text-slate-200 leading-relaxed shadow-sm">
              {alert.description}
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-1.5">
            <label className="text-xs font-chakra font-bold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-rose-400" />
              PACKET EVIDENCE & FORENSIC ARTIFACT
            </label>
            <div className="p-4 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all shadow-inner leading-relaxed">
              {alert.evidence || 'Pattern detected across multiple packet frames matching NIDS heuristic threshold.'}
            </div>
          </div>

          {/* Mitigation Command Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-chakra font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                AUTOMATED REMEDIATION (FIREWALL BLOCK COMMAND)
              </label>
              <button
                onClick={handleCopyIptables}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/90 border border-slate-800 font-mono text-xs text-amber-300 flex items-center justify-between shadow-inner">
              <code>{iptablesRule}</code>
            </div>
          </div>

          {/* Status Workflow Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-chakra font-bold text-white block">Incident Triage State</span>
              <span className="text-[11px] text-slate-400 font-mono">Update status in database</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['Open', 'Investigating', 'Resolved', 'False Positive'].map((st) => (
                <button
                  key={st}
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-chakra font-bold transition-all ${
                    status === st
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-chakra font-bold text-xs tracking-wider transition-all"
          >
            Close Forensics
          </button>
        </div>
      </div>
    </div>
  );
}
