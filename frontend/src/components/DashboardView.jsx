import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Activity, 
  Layers, 
  Crosshair, 
  Terminal, 
  ExternalLink,
  Zap,
  TrendingUp,
  Server,
  Lock,
  Cpu,
  Eye,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardView({ stats, onSelectAlert, onNavigateTab }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500">
        <div className="relative w-16 h-16 flex items-center justify-center mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
          <Activity className="w-8 h-8 text-cyan-400" />
        </div>
        <p className="font-mono text-sm tracking-wider text-slate-400">AGGREGATING LIVE SOC TELEMETRY...</p>
        <p className="text-xs text-slate-600 font-mono mt-1">Polling SQLite instance/nids.db</p>
      </div>
    );
  }

  const {
    total_packets = 0,
    total_alerts = 0,
    severity = { Critical: 0, High: 0, Medium: 0, Low: 0 },
    protocol_distribution = [],
    top_ports = [],
    top_attackers = [],
    recent_alerts = [],
    traffic_timeline = [],
    threat_posture = { level: 'ALL SYSTEMS SECURE', score: 5 }
  } = stats;

  const criticalCount = severity.Critical || 0;
  const highCount = severity.High || 0;
  const mediumCount = severity.Medium || 0;
  const lowCount = severity.Low || 0;

  // Calculate timeline SVG points
  const timelinePoints = traffic_timeline.map((item, idx) => ({
    x: idx,
    y: item.count,
    label: item.timestamp.split(' ')[1] || item.timestamp,
    fullTime: item.timestamp
  }));

  const maxY = Math.max(...timelinePoints.map(p => p.y), 10);
  const chartWidth = 650;
  const chartHeight = 170;

  const pointsSvg = timelinePoints.map((p, idx) => {
    const x = (idx / Math.max(timelinePoints.length - 1, 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 20 - (p.y / maxY) * (chartHeight - 45);
    return `${x},${y}`;
  }).join(' ');

  const areaSvg = pointsSvg ? `20,${chartHeight - 20} ${pointsSvg} ${(chartWidth - 20)},${chartHeight - 20}` : '';

  // Protocol colors
  const totalProtoCount = protocol_distribution.reduce((acc, p) => acc + p.count, 0) || 1;
  const protoColors = {
    TCP: '#00f0ff',
    UDP: '#a855f7',
    ICMP: '#ff0055',
    DNS: '#ffaa00',
    HTTP: '#10b981',
    FTP: '#ec4899',
    TELNET: '#f43f5e',
    SSH: '#38bdf8',
    OTHER: '#64748b'
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Threat Posture & Radar HUD Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7 border border-cyan-500/30 shadow-[0_15px_45px_rgba(0,0,0,0.8)] tech-corner-box">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"></div>
        {criticalCount > 0 && (
          <div className="absolute top-0 left-1/3 -mt-16 w-96 h-96 rounded-full bg-red-600/15 blur-[120px] pointer-events-none animate-pulse"></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          
          {/* Posture Score Dial / Radar Display */}
          <div className="lg:col-span-5 flex items-center space-x-6">
            
            {/* High-Tech Tactical Radar Dial */}
            <div className="relative flex items-center justify-center w-32 h-32 shrink-0 bg-slate-950/80 rounded-full border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
              
              {/* Concentric Radar Range Rings */}
              <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full border border-slate-800/60 pointer-events-none"></div>
              <div className="absolute inset-10 rounded-full border border-slate-800/40 pointer-events-none"></div>
              
              {/* Crosshair guide lines */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800/80 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800/80 pointer-events-none"></div>

              {/* Rotating Radar Sweep Line */}
              <div className="absolute inset-0 rounded-full pointer-events-none radar-sweep overflow-hidden">
                <div className="w-1/2 h-1/2 origin-bottom-right bg-linear-to-tr from-cyan-400/25 to-transparent"></div>
              </div>

              {/* Blinking Threat Beacon in Radar */}
              {criticalCount > 0 && (
                <div className="absolute top-7 right-8 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
              )}

              {/* Outer Circular Progress Gauge */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  className="text-slate-800/60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - (threat_posture.score || 5) / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className={`transition-all duration-1000 ${
                    criticalCount > 0 
                      ? 'text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                      : highCount > 0 
                      ? 'text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                      : 'text-cyan-400 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                  }`}
                />
              </svg>

              {/* Center Tactical Metric */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="font-orbitron text-3xl font-black tracking-tight text-white glow-text-cyan">
                  {threat_posture.score}%
                </span>
                <span className="text-[9px] font-mono font-bold text-cyan-400/90 uppercase tracking-widest mt-0.5">
                  DEF-INDEX
                </span>
              </div>
            </div>

            {/* Posture Text Summary */}
            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-lg ${criticalCount > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'}`}></span>
                <span className="text-xs font-chakra font-bold tracking-wider text-cyan-400 uppercase">
                  DEFENSE POSTURE STATUS
                </span>
              </div>
              <h2 className="text-2xl font-orbitron font-extrabold tracking-wide text-white mt-1">
                {threat_posture.level}
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed max-w-sm">
                Armed heuristic inspection: Port scans, SYN floods, ICMP storms, anomalous payloads, and exfiltration tunnels.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid inside Posture Banner */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-500/40 transition-colors group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
                <span>PACKETS</span>
                <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-orbitron font-black text-white tracking-tight">
                  {total_packets.toLocaleString()}
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-medium">Inspected Frames</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/25 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-rose-500/50 transition-colors group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
                <span>ALERTS</span>
                <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-orbitron font-black text-rose-400 tracking-tight">
                  {total_alerts}
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-medium">Heuristic Flags</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-red-500/60 transition-colors group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
                <span>CRITICAL</span>
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-orbitron font-black text-red-400 tracking-tight glow-text-red">
                  {criticalCount}
                </div>
                <span className="text-[10px] text-red-400 font-mono font-medium">Active Breach</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-emerald-500/40 transition-colors group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
                <span>SQL ENGINE</span>
                <Server className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-orbitron font-black text-emerald-400 tracking-tight">
                  ARMED
                </div>
                <span className="text-[10px] text-emerald-400/90 font-mono font-medium">WAL Journal</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Severity Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="glass-panel-interactive rounded-2xl p-3.5 flex items-center space-x-3.5 border-l-4 border-l-red-500">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center font-orbitron font-black text-red-400 text-sm shadow-[0_0_12px_rgba(255,0,85,0.4)]">
            {criticalCount}
          </div>
          <div>
            <div className="text-xs font-chakra font-bold text-red-300 tracking-wider">CRITICAL THREATS</div>
            <div className="text-[10px] text-slate-400 font-mono">Port Scan / SYN / ICMP Floods</div>
          </div>
        </div>

        <div className="glass-panel-interactive rounded-2xl p-3.5 flex items-center space-x-3.5 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-orbitron font-black text-amber-400 text-sm shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            {highCount}
          </div>
          <div>
            <div className="text-xs font-chakra font-bold text-amber-300 tracking-wider">HIGH RISK</div>
            <div className="text-[10px] text-slate-400 font-mono">Telnet/FTP & Backdoors</div>
          </div>
        </div>

        <div className="glass-panel-interactive rounded-2xl p-3.5 flex items-center space-x-3.5 border-l-4 border-l-cyan-500">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-orbitron font-black text-cyan-400 text-sm shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            {mediumCount}
          </div>
          <div>
            <div className="text-xs font-chakra font-bold text-cyan-300 tracking-wider">MEDIUM ANOMALIES</div>
            <div className="text-[10px] text-slate-400 font-mono">DNS Tunnels / Recon Probes</div>
          </div>
        </div>

        <div className="glass-panel-interactive rounded-2xl p-3.5 flex items-center space-x-3.5 border-l-4 border-l-slate-600">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-orbitron font-black text-slate-300 text-sm">
            {lowCount}
          </div>
          <div>
            <div className="text-xs font-chakra font-bold text-slate-300 tracking-wider">LOW / AUDIT LOGS</div>
            <div className="text-[10px] text-slate-400 font-mono">Telemetry & Baseline Events</div>
          </div>
        </div>

      </div>

      {/* Middle Row: Traffic Velocity Area Chart & Protocol Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Traffic Velocity Area Chart */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                PACKET TRAFFIC VELOCITY TIMELINE
              </h3>
              <p className="text-xs text-slate-400 font-mono">Real-time network capture intensity & burst analysis</p>
            </div>
            
            <button 
              onClick={() => onNavigateTab('traffic')}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              Stream Telemetry <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {timelinePoints.length > 0 ? (
            <div className="relative w-full h-48">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#152238" strokeDasharray="3 3" />
                <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#152238" strokeDasharray="3 3" />
                <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#1e293b" />

                {/* Filled Area */}
                {areaSvg && <polygon points={areaSvg} fill="url(#cyberAreaGrad)" />}

                {/* Stroke Line */}
                {pointsSvg && (
                  <polyline
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                    points={pointsSvg}
                    className="filter drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                  />
                )}

                {/* Interactive Points */}
                {timelinePoints.map((p, idx) => {
                  const x = (idx / Math.max(timelinePoints.length - 1, 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - 20 - (p.y / maxY) * (chartHeight - 45);
                  const isLast = idx === timelinePoints.length - 1;

                  return (
                    <g key={idx}>
                      {isLast && (
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="rgba(0, 240, 255, 0.25)"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isLast ? "4.5" : "3.5"}
                        fill="#040711"
                        stroke="#00f0ff"
                        strokeWidth="2"
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Point Tooltip */}
              {hoveredPoint && (
                <div className="absolute top-2 right-4 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-xl pointer-events-none">
                  <span>Timestamp: <strong className="text-white">{hoveredPoint.label}</strong> • Packets: <strong className="text-cyan-400">{hoveredPoint.y}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 font-mono text-xs">
              No traffic telemetry recorded yet. Ingest a PCAP or run a simulation.
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Peak Velocity: <strong className="text-white font-orbitron">{maxY} pkts/s</strong></span>
            <span>Recorded Time Intervals: <strong className="text-cyan-400">{timelinePoints.length}</strong></span>
          </div>
        </div>

        {/* Protocol Distribution Breakdown */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              PROTOCOL PROPORTIONS
            </h3>
            <p className="text-xs text-slate-400 font-mono">Distribution across network layers</p>
          </div>

          <div className="my-4 space-y-3">
            {protocol_distribution.length > 0 ? (
              protocol_distribution.slice(0, 6).map((p, idx) => {
                const percent = Math.round((p.count / totalProtoCount) * 100);
                const color = protoColors[p.protocol] || protoColors.OTHER;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
                        {p.protocol}
                      </span>
                      <span className="text-slate-400">
                        {p.count.toLocaleString()} <span className="text-slate-500">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No packet protocols logged
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Distinct Protocols: <strong className="text-purple-400 font-orbitron">{protocol_distribution.length}</strong></span>
            <span className="text-emerald-400 font-semibold">Active Layer 3/4</span>
          </div>
        </div>

      </div>

      {/* Third Row: Top Attackers & Targeted Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Aggressive Attacker IPs */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                PRIMARY THREAT ACTOR IPS
              </h3>
              <p className="text-xs text-slate-400 font-mono">Top malicious origin endpoints flagged</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(255,0,85,0.3)]">
              IP BLOCKLIST
            </span>
          </div>

          <div className="space-y-2.5">
            {top_attackers.length > 0 ? (
              top_attackers.map((att, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-red-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-orbitron font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-mono text-sm font-bold text-white flex items-center gap-2 group-hover:text-red-300 transition-colors">
                        {att.source_ip}
                        {idx === 0 && (
                          <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-red-600/30 text-red-300 border border-red-500/50 font-black tracking-wider animate-pulse">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Threat Activity: Elevated Recon Probe
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-xl font-mono text-xs font-bold bg-red-950/70 text-red-400 border border-red-900/60 shadow-sm">
                      {att.count} Threats
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No attacker IPs recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Targeted Destination Ports */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                TARGETED NETWORK SERVICE PORTS
              </h3>
              <p className="text-xs text-slate-400 font-mono">Service ports receiving high packet velocity</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              SERVICES
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {top_ports.length > 0 ? (
              top_ports.map((portItem, idx) => {
                const portNum = portItem.dst_port;
                const portLabels = {
                  80: 'HTTP Web Cleartext',
                  443: 'HTTPS Encrypted TLS',
                  21: 'FTP Cleartext Auth',
                  22: 'SSH Remote Shell',
                  23: 'Telnet Unencrypted',
                  53: 'DNS Port Service',
                  4444: 'Metasploit Shell',
                  31337: 'BackOrifice Trojan'
                };
                const label = portLabels[portNum] || `Service Port ${portNum}`;
                const isDangerous = [21, 23, 4444, 31337].includes(portNum);

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                      isDangerous 
                        ? 'bg-red-950/25 border-red-500/40 shadow-[0_0_15px_rgba(255,0,85,0.15)] hover:border-red-500/70' 
                        : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-orbitron font-black text-white">
                        :{portNum}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                        isDangerous ? 'bg-red-500/25 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {portItem.count} pkts
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-1.5 truncate font-medium">
                      {label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-slate-500 font-mono text-xs">
                No targeted ports logged.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fourth Row: Recent Security Alerts Live Feed */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              CHRONOLOGICAL INTRUSION INCIDENT STREAM
            </h3>
            <p className="text-xs text-slate-400 font-mono">Latest heuristic threat detections stored in SQLite</p>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 transition-all"
          >
            All Incident Logs <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-chakra tracking-wider text-xs">
                <th className="py-3 px-3.5">TIMESTAMP</th>
                <th className="py-3 px-3.5">SEVERITY</th>
                <th className="py-3 px-3.5">RULE SIGNATURE</th>
                <th className="py-3 px-3.5">SOURCE HOST</th>
                <th className="py-3 px-3.5">TARGET</th>
                <th className="py-3 px-3.5">TRIAGE</th>
                <th className="py-3 px-3.5 text-right">FORENSICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent_alerts.length > 0 ? (
                recent_alerts.map((alert) => {
                  const sevClasses = {
                    Critical: 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(255,0,85,0.4)]',
                    High: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
                    Medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
                    Low: 'bg-slate-800 text-slate-400 border-slate-700'
                  };
                  return (
                    <tr key={alert.id} className="hover:bg-cyan-950/20 transition-colors group">
                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">
                        {alert.timestamp}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-chakra font-bold border tracking-wider ${sevClasses[alert.severity] || sevClasses.Low}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {alert.rule_name}
                      </td>
                      <td className="py-3 px-3.5 text-cyan-300 font-bold">
                        {alert.source_ip || 'N/A'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300">
                        {alert.dest_ip}{alert.port ? `:${alert.port}` : ''}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                          alert.status === 'Resolved' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : alert.status === 'Investigating' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => onSelectAlert(alert)}
                          className="px-3 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-500/25 hover:text-cyan-300 border border-cyan-500/40 text-slate-200 text-xs font-chakra font-bold tracking-wider transition-all shadow-sm"
                        >
                          Forensic Drawer
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500 font-mono">
                    No recent alerts recorded. Network perimeter is secure.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
