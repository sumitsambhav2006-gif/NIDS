import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AlertsView from './components/AlertsView';
import TrafficView from './components/TrafficView';
import CaptureView from './components/CaptureView';
import SettingsView from './components/SettingsView';
import AlertDetailModal from './components/AlertDetailModal';
import SimulateModal from './components/SimulateModal';
import Cyber3DBackground from './components/Cyber3DBackground';
import { fetchStats, fetchSettings, saveSettings } from './utils/api';
import { playCyberBeep } from './utils/audio';
import { Shield, Database, Cpu, Terminal, Radio, Activity, Lock } from 'lucide-react';

const normalizeColorTheme = (val) => {
  if (!val) return 'green';
  if (['green', 'matrix-hex', 'matrix', 'threat-radar'].includes(val)) return 'green';
  if (['red', 'crimson-alert', 'crimson'].includes(val)) return 'red';
  if (['blue', 'network-topology', 'cyber-circuit', 'hex-shield', 'cyber-grid'].includes(val)) return 'blue';
  return 'green';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [bgTheme, setBgTheme] = useState(() => normalizeColorTheme(localStorage.getItem('nids_bg_theme')));
  const [bgGlow, setBgGlow] = useState(() => {
    const saved = parseFloat(localStorage.getItem('nids_bg_glow') || '0.24');
    return Number.isNaN(saved) ? 0.24 : saved;
  });
  const [bg3DEnabled, setBg3DEnabled] = useState(() => {
    return localStorage.getItem('nids_3d_bg_enabled') !== 'false';
  });
  const [bg3DSpeed, setBg3DSpeed] = useState(() => {
    const saved = parseFloat(localStorage.getItem('nids_3d_bg_speed') || '1.0');
    return Number.isNaN(saved) ? 1.0 : saved;
  });

  const handleThemeChange = (newTheme) => {
    const clean = normalizeColorTheme(newTheme);
    setBgTheme(clean);
    localStorage.setItem('nids_bg_theme', clean);
    saveSettings({ background_theme: clean }).catch(() => {});
  };

  const handleGlowChange = (val) => {
    const num = Math.min(0.5, Math.max(0.05, parseFloat(val) || 0.24));
    setBgGlow(num);
    localStorage.setItem('nids_bg_glow', String(num));
  };

  const handle3DEnabledChange = (val) => {
    setBg3DEnabled(val);
    localStorage.setItem('nids_3d_bg_enabled', val ? 'true' : 'false');
  };

  const handle3DSpeedChange = (val) => {
    const num = Math.min(2.5, Math.max(0.2, parseFloat(val) || 1.0));
    setBg3DSpeed(num);
    localStorage.setItem('nids_3d_bg_speed', String(num));
  };

  const prevAlertsCount = useRef(null);

  const loadDashboardStats = async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const data = await fetchStats();
      
      // Check if new alert arrived to play alert sound
      if (prevAlertsCount.current !== null && data.total_alerts > prevAlertsCount.current) {
        if (soundEnabled) {
          if (data.severity?.Critical > 0) {
            playCyberBeep('critical');
          } else {
            playCyberBeep('warning');
          }
        }
      }
      prevAlertsCount.current = data.total_alerts;

      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      if (isManual) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats(true);
    fetchSettings()
      .then((data) => {
        if (data?.background_theme) {
          const clean = normalizeColorTheme(data.background_theme);
          setBgTheme(clean);
          localStorage.setItem('nids_bg_theme', clean);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-refresh interval effect
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      loadDashboardStats(false);
    }, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval, soundEnabled]);

  const themeBackgroundStyle =
    bgTheme === 'green'
      ? {
          backgroundColor: '#030d07',
          backgroundImage: `radial-gradient(circle at 18% 18%, rgba(0, 255, 136, ${bgGlow}) 0%, transparent 48%), radial-gradient(circle at 82% 82%, rgba(16, 185, 129, ${(bgGlow * 0.85).toFixed(2)}) 0%, transparent 52%), linear-gradient(160deg, #020a05 0%, #061b0f 52%, #020804 100%)`,
          backgroundAttachment: 'fixed',
        }
      : bgTheme === 'red'
      ? {
          backgroundColor: '#140408',
          backgroundImage: `radial-gradient(circle at 18% 18%, rgba(255, 51, 102, ${bgGlow}) 0%, transparent 48%), radial-gradient(circle at 82% 82%, rgba(220, 38, 38, ${(bgGlow * 0.85).toFixed(2)}) 0%, transparent 52%), linear-gradient(160deg, #0e0205 0%, #24070f 52%, #0d0205 100%)`,
          backgroundAttachment: 'fixed',
        }
      : {
          backgroundColor: '#040a18',
          backgroundImage: `radial-gradient(circle at 18% 18%, rgba(0, 168, 255, ${bgGlow}) 0%, transparent 48%), radial-gradient(circle at 82% 82%, rgba(56, 189, 248, ${(bgGlow * 0.85).toFixed(2)}) 0%, transparent 52%), linear-gradient(160deg, #020612 0%, #071630 52%, #030714 100%)`,
          backgroundAttachment: 'fixed',
        };

  return (
    <div
      style={themeBackgroundStyle}
      className="min-h-screen text-slate-100 flex flex-col font-sans relative transition-all duration-300 selection:bg-cyan-500/30 selection:text-cyan-200"
    >

      {/* 3D Cybersecurity Hologram Globe & Orbiting Words/Numbers */}
      <Cyber3DBackground theme={bgTheme} enabled={bg3DEnabled} speed={bg3DSpeed} />

      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onRefresh={() => loadDashboardStats(true)}
        isLoading={isLoading}
        onOpenSimulate={() => setIsSimulateOpen(true)}
        bgTheme={bgTheme}
        onChangeBgTheme={handleThemeChange}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            onSelectAlert={(alert) => setSelectedAlert(alert)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            onSelectAlert={(alert) => setSelectedAlert(alert)}
            onAlertsUpdated={() => loadDashboardStats(false)}
          />
        )}

        {activeTab === 'traffic' && (
          <TrafficView />
        )}

        {activeTab === 'capture' && (
          <CaptureView
            onCaptureProcessed={() => loadDashboardStats(false)}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onSettingsSaved={() => loadDashboardStats(false)}
            bgTheme={bgTheme}
            onChangeBgTheme={handleThemeChange}
            bgGlow={bgGlow}
            onChangeBgGlow={handleGlowChange}
            bg3DEnabled={bg3DEnabled}
            onChangeBg3DEnabled={handle3DEnabledChange}
            bg3DSpeed={bg3DSpeed}
            onChangeBg3DSpeed={handle3DSpeedChange}
          />
        )}
      </main>

      {/* Forensic Inspection Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={() => loadDashboardStats(false)}
        />
      )}

      {/* Attack Simulator Modal */}
      <SimulateModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onAttackSimulated={() => loadDashboardStats(false)}
        soundEnabled={soundEnabled}
      />

      {/* Bottom Status Footer */}
      <footer className="relative z-10 mt-auto border-t border-cyan-500/15 bg-[#02040a]/90 backdrop-blur-md py-3.5 text-xs font-mono text-slate-400 shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              NIDS DAEMON: ONLINE & ARMED
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              SQLITE 3 WAL JOURNAL
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              SCAPY 2.8 ENGINE
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-chakra font-medium">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              PERIMETER TELEMETRY
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400 font-bold">PORT 5000 / 5173</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
