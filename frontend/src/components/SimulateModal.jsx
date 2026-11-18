import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Flame, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { simulateAttack } from '../utils/api';
import { playCyberBeep } from '../utils/audio';

export default function SimulateModal({ isOpen, onClose, onAttackSimulated, soundEnabled }) {
  const [attackType, setAttackType] = useState('port_scan');
  const [count, setCount] = useState(25);
  const [attackerIp, setAttackerIp] = useState('192.168.1.189');
  const [targetIp, setTargetIp] = useState('192.168.1.10');
  const [targetPort, setTargetPort] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await simulateAttack({
        attackType,
        count,
        attackerIp,
        targetIp,
        targetPort
      });
      setResult(data);
      if (soundEnabled) {
        playCyberBeep('critical');
      }
      if (onAttackSimulated) onAttackSimulated();
    } catch (err) {
      setError(err.message || 'Simulation execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#080d1a] border border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(255,0,85,0.35)] p-7 tech-corner-box">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(255,0,85,0.4)]">
              <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-white">
                LIVE SOC ATTACK INJECTOR
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Simulate offensive bursts to test Scapy heuristics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/60 text-cyan-300 text-xs font-mono flex items-start space-x-3 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-orbitron font-bold text-white text-sm">{result.message}</div>
              <div className="mt-1 text-cyan-200">
                Injected <strong className="text-white">{result.packet_count}</strong> packets • <strong className="text-red-400">{result.alert_count}</strong> alerts logged in SQLite
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/60 text-red-300 text-xs font-mono flex items-center space-x-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-chakra font-bold text-slate-300 block mb-1.5">
              Select Threat Scenario
            </label>
            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="port_scan">Nmap Port Scan Reconnaissance (Ports 20-45)</option>
              <option value="syn_flood">SYN Flood Denial of Service (DoS)</option>
              <option value="icmp_flood">ICMP Echo Storm / Ping Sweep</option>
              <option value="suspicious_ports">C2 Backdoor & Remote Shell Probe</option>
              <option value="dns_tunnel">DNS Exfiltration Query</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Attacker IP
              </label>
              <input
                type="text"
                value={attackerIp}
                onChange={(e) => setAttackerIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Target Victim IP
              </label>
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Packets to Inject
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Target Port
              </label>
              <input
                type="number"
                min="1"
                max="65535"
                value={targetPort}
                onChange={(e) => setTargetPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-chakra font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-chakra font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-red-400/50 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>TRANSMITTING ATTACK...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-yellow-300" />
                  <span>TRIGGER INJECTION</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
