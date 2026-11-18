import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Radio, 
  UploadCloud, 
  Sliders, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Zap,
  Flame,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Terminal,
  Crosshair
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  stats, 
  soundEnabled, 
  setSoundEnabled, 
  refreshInterval, 
  setRefreshInterval, 
  onRefresh, 
  isLoading,
  onOpenSimulate,
  bgTheme = 'green',
  onChangeBgTheme
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const posture = stats?.threat_posture || { level: 'ALL SYSTEMS SECURE', score: 5 };
  const totalAlerts = stats?.total_alerts || 0;
  const criticalCount = stats?.severity?.Critical || 0;
  const highCount = stats?.severity?.High || 0;

  // Tactical Posture styling
  const getPostureBadge = () => {
    if (criticalCount > 0 || posture.score >= 80) {
      return {
        defcon: 'DEFCON 1',
        title: 'CRITICAL INTRUSION',
        bg: 'bg-red-500/15 text-red-300 border-red-500/50 cyber-glow-red',
        icon: <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />,
        pulse: 'bg-red-500',
        ring: 'border-red-500'
      };
    }
    if (highCount > 0 || posture.score >= 50) {
      return {
        defcon: 'DEFCON 2',
        title: 'ELEVATED THREAT',
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/50',
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        pulse: 'bg-amber-500',
        ring: 'border-amber-500'
      };
    }
    return {
      defcon: 'DEFCON 5',
      title: 'PERIMETER SECURE',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 cyber-glow-green',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      pulse: 'bg-emerald-400',
      ring: 'border-emerald-500'
    };
  };

  const badge = getPostureBadge();

  const navItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: Activity, count: null },
    { id: 'alerts', label: 'Threats & Alerts', icon: ShieldAlert, count: totalAlerts, alertVariant: criticalCount > 0 },
    { id: 'traffic', label: 'Packet Inspector', icon: Radio, count: stats?.total_packets || null },
    { id: 'capture', label: 'PCAP & Simulator', icon: UploadCloud, count: null },
    { id: 'settings', label: 'Rules & Engine', icon: Sliders, count: null },
  ];

  const themeAccent =
    bgTheme === 'green'
      ? {
          bar: 'via-emerald-400',
          border: 'border-emerald-500/25',
          logoBox: 'from-emerald-950/80 via-slate-900 to-teal-950/60 border-emerald-500/50 shadow-[0_0_20px_rgba(0,255,136,0.3)]',
          logoRing: 'border-emerald-400/35',
          icon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,136,0.75)]',
          brandText: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(0,255,136,0.85)]',
          pill: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40',
        }
      : bgTheme === 'red'
      ? {
          bar: 'via-rose-500',
          border: 'border-rose-500/25',
          logoBox: 'from-rose-950/80 via-slate-900 to-red-950/60 border-rose-500/50 shadow-[0_0_20px_rgba(255,51,102,0.35)]',
          logoRing: 'border-rose-400/35',
          icon: 'text-rose-400 drop-shadow-[0_0_8px_rgba(255,51,102,0.75)]',
          brandText: 'text-rose-400 drop-shadow-[0_0_12px_rgba(255,51,102,0.85)]',
          pill: 'bg-rose-950/90 text-rose-300 border-rose-500/40',
        }
      : {
          bar: 'via-sky-400',
          border: 'border-sky-500/25',
          logoBox: 'from-sky-950/80 via-slate-900 to-blue-950/60 border-sky-500/50 shadow-[0_0_20px_rgba(0,168,255,0.35)]',
          logoRing: 'border-sky-400/35',
          icon: 'text-sky-400 drop-shadow-[0_0_8px_rgba(0,168,255,0.75)]',
          brandText: 'text-sky-400 drop-shadow-[0_0_12px_rgba(0,168,255,0.85)]',
          pill: 'bg-sky-950/90 text-sky-300 border-sky-500/40',
        };

  return (
    <header className={`sticky top-0 z-50 bg-[#040711]/90 backdrop-blur-xl border-b ${themeAccent.border} shadow-[0_10px_35px_rgba(0,0,0,0.85)] transition-colors duration-300`}>
      {/* Top Ambient Highlight Border */}
      <div className={`h-0.5 w-full bg-linear-to-r from-transparent ${themeAccent.bar} to-transparent opacity-90`}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br border ${themeAccent.logoBox}`}>
              {/* Rotating outer radar ring */}
              <div className={`absolute inset-0 rounded-xl border border-dashed ${themeAccent.logoRing} animate-[spin_10s_linear_infinite] pointer-events-none`}></div>
              
              <ShieldAlert className={`w-6 h-6 filter ${themeAccent.icon}`} />
              
              {/* Status Ping Dot */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.pulse}`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-[#040711] ${badge.pulse}`}></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-orbitron font-black text-2xl tracking-widest ${themeAccent.brandText}`}>
                  NIDS
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border tracking-wider ${themeAccent.pill}`}>
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-2 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-semibold">NETWORK INTRUSION DETECTION</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400/90 flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  SCAPY HEURISTICS
                </span>
              </p>
            </div>
          </div>

          {/* Tactical Defense HUD & Live Clock */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Live Clock Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold tracking-wider">{timeStr || 'LIVE SEC-OPS'}</span>
            </div>

            {/* DEFCON Threat Badge */}
            <div className={`flex items-center space-x-2.5 px-4 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all duration-300 ${badge.bg}`}>
              {badge.icon}
              <span className="tracking-wider">{badge.defcon}: {badge.title}</span>
              <span className="text-[10px] opacity-80 border-l border-current/40 pl-2">
                RISK {posture.score}%
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2.5">

            {/* Quick 1-Click Background Color Switcher (Green / Blue / Red) */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80" title="Switch Background Theme (Green / Blue / Red)">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Theme</span>
              <button
                type="button"
                onClick={() => onChangeBgTheme && onChangeBgTheme('green')}
                title="Cyber Green Background"
                aria-label="Cyber Green Background"
                className={`w-4 h-4 rounded-full bg-[#00ff88] transition-transform cursor-pointer ${
                  bgTheme === 'green' ? 'ring-2 ring-white scale-115 shadow-[0_0_12px_#00ff88]' : 'opacity-65 hover:opacity-100 hover:scale-110'
                }`}
              />
              <button
                type="button"
                onClick={() => onChangeBgTheme && onChangeBgTheme('blue')}
                title="Cyber Blue Background"
                aria-label="Cyber Blue Background"
                className={`w-4 h-4 rounded-full bg-[#00a8ff] transition-transform cursor-pointer ${
                  bgTheme === 'blue' ? 'ring-2 ring-white scale-115 shadow-[0_0_12px_#00a8ff]' : 'opacity-65 hover:opacity-100 hover:scale-110'
                }`}
              />
              <button
                type="button"
                onClick={() => onChangeBgTheme && onChangeBgTheme('red')}
                title="Cyber Red Background"
                aria-label="Cyber Red Background"
                className={`w-4 h-4 rounded-full bg-[#ff3366] transition-transform cursor-pointer ${
                  bgTheme === 'red' ? 'ring-2 ring-white scale-115 shadow-[0_0_12px_#ff3366]' : 'opacity-65 hover:opacity-100 hover:scale-110'
                }`}
              />
            </div>
            
            {/* Tactical Attack Simulation Trigger */}
            <button
              onClick={onOpenSimulate}
              className="relative group overflow-hidden flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-chakra tracking-wide bg-linear-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-red-400/50 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
              title="Launch Test Attack Simulation"
            >
              <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>TEST ATTACK</span>
            </button>

            {/* Sound Toggle with Equalizer Visualizer */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs border transition-all duration-200 ${
                soundEnabled 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:bg-cyan-900/40' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Cyber Sound Alerts: Enabled' : 'Cyber Sound Alerts: Muted'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span className="flex items-center h-3">
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                  </span>
                </>
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Auto-Refresh Controller */}
            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800/90 rounded-xl p-1 shadow-inner">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 disabled:opacity-40 transition-all"
                title="Manual Telemetry Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none pr-1.5 cursor-pointer font-bold"
                title="Auto Refresh Rate"
              >
                <option value={3000} className="bg-slate-900 text-white">3s</option>
                <option value={5000} className="bg-slate-900 text-white">5s</option>
                <option value={10000} className="bg-slate-900 text-white">10s</option>
                <option value={0} className="bg-slate-900 text-white">Off</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1.5 border-t border-slate-800/80 pt-1.5 pb-2.5 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-chakra font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-cyan-500/20 via-sky-500/15 to-transparent text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400 filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                
                {item.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                    item.alertVariant 
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(255,0,85,0.5)] animate-pulse' 
                      : 'bg-slate-800/90 text-slate-300 border border-slate-700/60'
                  }`}>
                    {item.count}
                  </span>
                )}

                {/* Active Neon Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-linear-to-r from-cyan-400 to-sky-300 rounded-full shadow-[0_0_8px_#00f0ff]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
