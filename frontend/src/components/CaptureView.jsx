import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Zap, 
  FileCheck, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Flame, 
  Crosshair, 
  Server, 
  CheckCircle,
  Radio,
  Sliders,
  Terminal,
  Activity,
  Play
} from 'lucide-react';
import { fetchSamplePcaps, loadSamplePcap, uploadPcapFile, simulateAttack } from '../utils/api';
import { playCyberBeep } from '../utils/audio';

export default function CaptureView({ onCaptureProcessed, soundEnabled }) {
  const [samples, setSamples] = useState([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Simulation form states
  const [simType, setSimType] = useState('port_scan');
  const [simCount, setSimCount] = useState(25);
  const [simAttackerIp, setSimAttackerIp] = useState('192.168.1.189');
  const [simTargetIp, setSimTargetIp] = useState('192.168.1.10');
  const [simTargetPort, setSimTargetPort] = useState(80);

  const loadSamples = async () => {
    setIsLoadingSamples(true);
    try {
      const data = await fetchSamplePcaps();
      setSamples(data.samples || []);
    } catch (err) {
      console.error('Failed to load sample pcaps:', err);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveAction('upload');
    setErrorMsg(null);
    setUploadResult(null);

    try {
      const result = await uploadPcapFile(file);
      setUploadResult(result);
      if (soundEnabled) {
        playCyberBeep(result.data?.alert_count > 0 ? 'critical' : 'success');
      }
      if (onCaptureProcessed) onCaptureProcessed();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload and analyze PCAP.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleLoadSample = async (sampleName) => {
    setActiveAction(`sample_${sampleName}`);
    setErrorMsg(null);
    setUploadResult(null);

    try {
      const result = await loadSamplePcap(sampleName);
      setUploadResult(result);
      if (soundEnabled) {
        playCyberBeep(result.data?.alert_count > 0 ? 'critical' : 'success');
      }
      if (onCaptureProcessed) onCaptureProcessed();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to analyze sample PCAP.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setActiveAction('simulating');
    setErrorMsg(null);
    setUploadResult(null);

    try {
      const result = await simulateAttack({
        attackType: simType,
        count: simCount,
        attackerIp: simAttackerIp,
        targetIp: simTargetIp,
        targetPort: simTargetPort,
      });
      setUploadResult({
        message: result.message,
        data: {
          packet_count: result.packet_count,
          alert_count: result.alert_count,
          alerts: result.alerts
        }
      });
      if (soundEnabled) {
        playCyberBeep('critical');
      }
      if (onCaptureProcessed) onCaptureProcessed();
    } catch (err) {
      setErrorMsg(err.message || 'Simulation error.');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-orbitron font-extrabold tracking-wide text-white flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
            PCAP TRAFFIC INGESTION & THREAT RANGE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Analyze Wireshark / tcpdump captures or inject synthetic adversary traffic in real-time
          </p>
        </div>
      </div>

      {/* Result Alert Notice */}
      {uploadResult && (
        <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/60 text-cyan-300 font-mono text-xs flex items-start space-x-3.5 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
          <CheckCircle className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-orbitron font-bold text-white text-base">
              {uploadResult.message || 'Capture Analysis Executed Successfully'}
            </div>
            {uploadResult.data && (
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Packets Ingested: <strong className="text-cyan-400 font-orbitron">{uploadResult.data.packet_count}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Threats Triggered: <strong className="text-red-400 font-orbitron">{uploadResult.data.alert_count}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/60 text-red-300 font-mono text-xs flex items-center space-x-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Upload Dropzone & Live Attack Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Upload PCAP Dropzone */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2 mb-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              UPLOAD EXTERNAL PCAP CAPTURE
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Supports <code className="text-cyan-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">.pcap</code>, <code className="text-cyan-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">.pcapng</code>, and <code className="text-cyan-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">.cap</code> captures generated by Wireshark, tcpdump, or Zeek.
            </p>

            <label className="relative flex flex-col items-center justify-center p-9 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/70 rounded-3xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 group shadow-inner">
              <input
                type="file"
                accept=".pcap,.pcapng,.cap"
                onChange={handleFileUpload}
                disabled={activeAction !== null}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all mb-3.5">
                {activeAction === 'upload' ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <span className="text-sm font-chakra font-bold text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                {activeAction === 'upload' ? 'Parsing Scapy Packet Stream...' : 'Click or Drag & Drop PCAP to Inspect'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                Max file size: 100MB • Auto Heuristic Detection
              </span>
            </label>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Heuristic Engine: <strong className="text-slate-300">Scapy 2.8.0</strong></span>
            <span>Database: <strong className="text-cyan-400">SQLite 3 WAL</strong></span>
          </div>
        </div>

        {/* Right Col: Live Cyber Attack Range Simulator */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              LIVE SOC ATTACK RANGE SIMULATOR
            </h3>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
              SYNTHETIC INJECTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Generate synthetic packet bursts and evaluate detection heuristics in real-time.
          </p>

          <form onSubmit={handleSimulate} className="space-y-4">
            
            {/* Attack Type Selection */}
            <div>
              <label className="text-xs font-chakra font-bold text-slate-300 block mb-1.5">
                Attack Vector Scenario
              </label>
              <select
                value={simType}
                onChange={(e) => setSimType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="port_scan">Nmap Port Scan Reconnaissance (Ports 20-45)</option>
                <option value="syn_flood">TCP SYN Flood Denial of Service (DoS)</option>
                <option value="icmp_flood">ICMP Echo Storm / Ping Sweep Anomaly</option>
                <option value="suspicious_ports">C2 Backdoor & Cleartext Telnet/FTP Probes</option>
                <option value="dns_tunnel">DNS Tunneling & Data Exfiltration</option>
              </select>
            </div>

            {/* Custom Parameters */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Attacker Source IP
                </label>
                <input
                  type="text"
                  value={simAttackerIp}
                  onChange={(e) => setSimAttackerIp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Target Host IP
                </label>
                <input
                  type="text"
                  value={simTargetIp}
                  onChange={(e) => setSimTargetIp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Packet Burst Count
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={simCount}
                  onChange={(e) => setSimCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Target Port (for DoS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={simTargetPort}
                  onChange={(e) => setSimTargetPort(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={activeAction !== null}
              className="w-full py-3 rounded-2xl font-chakra text-xs font-bold tracking-wider bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-red-400/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {activeAction === 'simulating' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>TRANSMITTING SYNTHETIC TRAFFIC...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-yellow-300" />
                  <span>LAUNCH ATTACK SIMULATION</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Preset Sample PCAPs (1-Click Run) */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-chakra font-bold tracking-wider text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              CURATED PCAP BENCHMARK SCENARIOS (1-CLICK LOAD)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Pre-recorded intrusion PCAPs ready for immediate heuristic evaluation
            </p>
          </div>
          <button
            onClick={loadSamples}
            disabled={isLoadingSamples}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSamples ? 'animate-spin' : ''}`} />
            <span>Reload Scenarios</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {samples.map((s) => {
            const isProcessing = activeAction === `sample_${s.filename}`;
            const sevColor = s.severity === 'Critical' 
              ? 'border-red-500/50 text-red-300 bg-red-950/30 shadow-[0_0_8px_rgba(255,0,85,0.3)]' 
              : 'border-amber-500/50 text-amber-300 bg-amber-950/30';

            return (
              <div 
                key={s.filename}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-chakra font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {s.title}
                    </span>
                    <span className={`text-[10px] font-chakra font-bold px-2.5 py-0.5 rounded-full border ${sevColor}`}>
                      {s.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
                    {s.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500">
                    {s.filename} • <strong className="text-slate-400">{s.filesize}</strong>
                  </div>

                  <button
                    onClick={() => handleLoadSample(s.filename)}
                    disabled={activeAction !== null}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-chakra font-bold tracking-wider transition-all flex items-center space-x-1.5 disabled:opacity-50 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Replay PCAP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
