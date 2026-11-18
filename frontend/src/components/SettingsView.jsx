import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Save, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Volume2,
  Terminal,
  Cpu,
  Lock,
  Layers
} from 'lucide-react';
import { fetchSettings, saveSettings, clearAllData } from '../utils/api';
import { playCyberBeep } from '../utils/audio';

const COLOR_THEMES = [
  {
    id: 'green',
    name: 'Cyber Green',
    desc: 'Deep dark emerald background with neon green defense accents & glow',
    previewStyle: 'radial-gradient(circle at 25% 25%, rgba(0, 255, 136, 0.45) 0%, #03150b 75%)',
    borderActive: 'border-emerald-400/80 shadow-[0_0_24px_rgba(0,255,136,0.28)] ring-1 ring-emerald-400/50',
    badgeClass: 'text-emerald-300 border-emerald-400/40',
    dotColor: '#00ff88',
  },
  {
    id: 'blue',
    name: 'Cyber Blue',
    desc: 'Deep midnight navy background with electric blue telemetry accents',
    previewStyle: 'radial-gradient(circle at 25% 25%, rgba(0, 168, 255, 0.48) 0%, #041026 75%)',
    borderActive: 'border-sky-400/80 shadow-[0_0_24px_rgba(0,168,255,0.28)] ring-1 ring-sky-400/50',
    badgeClass: 'text-sky-300 border-sky-400/40',
    dotColor: '#00a8ff',
  },
  {
    id: 'red',
    name: 'Cyber Red',
    desc: 'DEFCON-1 tactical crimson dark theme with high-alert red glow',
    previewStyle: 'radial-gradient(circle at 25% 25%, rgba(255, 51, 102, 0.50) 0%, #1d040b 75%)',
    borderActive: 'border-rose-400/80 shadow-[0_0_24px_rgba(255,51,102,0.32)] ring-1 ring-rose-400/50',
    badgeClass: 'text-rose-300 border-rose-400/40',
    dotColor: '#ff3366',
  },
];

export default function SettingsView({
  onSettingsSaved,
  bgTheme = 'green',
  onChangeBgTheme,
  bgGlow = 0.24,
  onChangeBgGlow,
  bg3DEnabled = true,
  onChangeBg3DEnabled,
  bg3DSpeed = 1.0,
  onChangeBg3DSpeed
}) {
  const [settings, setSettings] = useState({
    port_scan_threshold: '10',
    syn_flood_threshold: '20',
    icmp_flood_threshold: '15',
    rule_port_scan_enabled: 'true',
    rule_syn_flood_enabled: 'true',
    rule_icmp_flood_enabled: 'true',
    rule_suspicious_ports_enabled: 'true',
    rule_dns_tunnel_enabled: 'true',
    sound_alerts: 'true',
    canvas_animation: 'false',
    background_theme: bgTheme || 'green'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettings();
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings(settings);
      setSaveSuccess(true);
      playCyberBeep('success');
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm("WARNING: Are you sure you want to wipe all security alerts and traffic events from SQLite?")) return;
    try {
      await clearAllData();
      alert("Database wiped successfully. Ready for new traffic capture.");
      if (onSettingsSaved) onSettingsSaved();
    } catch (err) {
      alert(`Wipe failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-orbitron font-extrabold tracking-wide text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
            NIDS DETECTION RULES & HEURISTIC ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Calibrate Scapy packet thresholds and intrusion signatures stored in SQLite
          </p>
        </div>

        <button
          onClick={loadSettings}
          disabled={isLoading}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all shadow-sm"
          title="Reload Stored Settings"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 font-mono text-xs flex items-center space-x-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">Settings and detection thresholds saved to SQLite successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Background Color Theme & Customization (Green / Blue / Red) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              BACKGROUND COLOR THEME & CUSTOMIZATION
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              GREEN / BLUE / RED LIVE THEMES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {COLOR_THEMES.map((t) => {
              const isSelected = (bgTheme || 'green') === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    handleChange('background_theme', t.id);
                    if (onChangeBgTheme) onChangeBgTheme(t.id);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `bg-slate-900/90 ${t.borderActive}`
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/70'
                  }`}
                >
                  <div
                    className="h-16 rounded-xl mb-3 border border-white/10 flex items-center justify-between px-3.5"
                    style={{ background: t.previewStyle }}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: t.dotColor, boxShadow: `0 0 12px ${t.dotColor}` }}
                    />
                    {isSelected && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 border ${t.badgeClass}`}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-chakra font-bold text-white tracking-wide">{t.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">{t.desc}</div>
                </button>
              );
            })}
          </div>

          {/* 3D Model & Glow Customization Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 3D Cyber Model Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-chakra font-bold text-slate-200">3D Cyber Hologram</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">3D Globe, Core & Orbiting Words</div>
              </div>
              <input
                type="checkbox"
                checked={bg3DEnabled}
                onChange={(e) => onChangeBg3DEnabled && onChangeBg3DEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-950 accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 3D Rotation Speed Slider */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-chakra font-bold text-sm">3D Orbit Speed</span>
                <span className="text-emerald-400 font-orbitron font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                  {(bg3DSpeed || 1.0).toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={bg3DSpeed}
                onChange={(e) => onChangeBg3DSpeed && onChangeBg3DSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Background Glow Intensity Slider */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-chakra font-bold text-sm">Background Glow</span>
                <span className="text-cyan-400 font-orbitron font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                  {Math.round((bgGlow || 0.24) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={bgGlow}
                onChange={(e) => onChangeBgGlow && onChangeBgGlow(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>
        </div>
        
        {/* Detection Rules Toggles */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            ACTIVE HEURISTIC DETECTION MODULES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-chakra font-bold text-white tracking-wide">Port Scan Reconnaissance</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Detects multi-port probes from single IP</div>
              </div>
              <input
                type="checkbox"
                checked={settings.rule_port_scan_enabled === 'true'}
                onChange={(e) => handleChange('rule_port_scan_enabled', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 text-cyan-500 bg-slate-950 rounded-lg border-slate-700 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-chakra font-bold text-white tracking-wide">SYN Flood DoS Engine</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Flags rapid unacknowledged SYN packets</div>
              </div>
              <input
                type="checkbox"
                checked={settings.rule_syn_flood_enabled === 'true'}
                onChange={(e) => handleChange('rule_syn_flood_enabled', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 text-cyan-500 bg-slate-950 rounded-lg border-slate-700 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-chakra font-bold text-white tracking-wide">ICMP Flood / Ping Storms</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Identifies excessive echo request floods</div>
              </div>
              <input
                type="checkbox"
                checked={settings.rule_icmp_flood_enabled === 'true'}
                onChange={(e) => handleChange('rule_icmp_flood_enabled', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 text-cyan-500 bg-slate-950 rounded-lg border-slate-700 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-chakra font-bold text-white tracking-wide">Suspicious Port & Backdoor Monitor</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Alerts on ports 21, 23, 4444, 5555, 31337</div>
              </div>
              <input
                type="checkbox"
                checked={settings.rule_suspicious_ports_enabled === 'true'}
                onChange={(e) => handleChange('rule_suspicious_ports_enabled', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 text-cyan-500 bg-slate-950 rounded-lg border-slate-700 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between md:col-span-2">
              <div>
                <div className="text-xs font-chakra font-bold text-white tracking-wide">DNS Data Tunneling & Exfiltration</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Inspects oversized DNS query payloads & Base64 subdomains</div>
              </div>
              <input
                type="checkbox"
                checked={settings.rule_dns_tunnel_enabled === 'true'}
                onChange={(e) => handleChange('rule_dns_tunnel_enabled', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 text-cyan-500 bg-slate-950 rounded-lg border-slate-700 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
              />
            </div>

          </div>
        </div>

        {/* Heuristic Threshold Sliders */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-purple-400" />
            HEURISTIC SENSITIVITY CALIBRATION
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-chakra font-bold text-sm">Port Scan Sensitivity Threshold</span>
                <span className="text-cyan-400 font-orbitron font-bold px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm">
                  {settings.port_scan_threshold} ports
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={settings.port_scan_threshold}
                onChange={(e) => handleChange('port_scan_threshold', e.target.value)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                Number of unique destination ports targeted by an IP before triggering a Port Scan Alert.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-chakra font-bold text-sm">SYN Flood Sensitivity Threshold</span>
                <span className="text-cyan-400 font-orbitron font-bold px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm">
                  {settings.syn_flood_threshold} pkts
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={settings.syn_flood_threshold}
                onChange={(e) => handleChange('syn_flood_threshold', e.target.value)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                Rapid SYN packets destined to a single port before triggering a SYN Flood DoS Alert.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-chakra font-bold text-sm">ICMP Flood Sensitivity Threshold</span>
                <span className="text-cyan-400 font-orbitron font-bold px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm">
                  {settings.icmp_flood_threshold} requests
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={settings.icmp_flood_threshold}
                onChange={(e) => handleChange('icmp_flood_threshold', e.target.value)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                Number of ICMP echo requests sent within window before triggering an ICMP Flood Alert.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleWipeDatabase}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-xs font-chakra font-bold tracking-wider bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 text-red-300 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Reset Database & Wipe Telemetry</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-2xl text-xs font-chakra font-bold tracking-wider bg-linear-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{isSaving ? 'Writing to SQLite...' : 'Save Rule Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
