import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Layers, 
  Binary, 
  Eye, 
  X, 
  Shield, 
  Hash, 
  Cpu, 
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { fetchTraffic } from '../utils/api';

export default function TrafficView() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [protocol, setProtocol] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState(null);

  const loadTraffic = async (targetPage = page) => {
    setIsLoading(true);
    try {
      const data = await fetchTraffic({
        page: targetPage,
        perPage: 25,
        protocol,
        search,
      });
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load traffic:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTraffic(1);
  }, [protocol]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTraffic(1);
  };

  const protoBadge = (p) => {
    switch (p?.toUpperCase()) {
      case 'TCP':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]';
      case 'UDP':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]';
      case 'ICMP':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(255,0,85,0.3)]';
      case 'DNS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'HTTP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
      case 'FTP':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-orbitron font-extrabold tracking-wide text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse filter drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
            PACKET INSPECTOR & WIRESHARK STREAM
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Total Captured Telemetry: <strong className="text-cyan-400 font-orbitron">{total}</strong> frames logged in SQLite
          </p>
        </div>

        {/* Protocol Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'FTP'].map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocol(proto)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-chakra font-bold tracking-wider transition-all duration-200 ${
                protocol === proto
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-400/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, flags, ports, payload text, or dissections..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
          />
        </form>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadTraffic(page)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-chakra font-bold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">FRAME</th>
                <th className="py-3.5 px-4">TIMESTAMP</th>
                <th className="py-3.5 px-4">PROTO</th>
                <th className="py-3.5 px-4">SOURCE HOST</th>
                <th className="py-3.5 px-4">DESTINATION HOST</th>
                <th className="py-3.5 px-4">LENGTH</th>
                <th className="py-3.5 px-4">FLAGS</th>
                <th className="py-3.5 px-4">PACKET DISSECTION</th>
                <th className="py-3.5 px-4 text-right">DISSECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-cyan-400 mb-3" />
                    Streaming packet frames from SQLite database...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-cyan-950/15 transition-colors group">
                    <td className="py-3 px-4 text-slate-500 font-orbitron font-bold group-hover:text-cyan-400 transition-colors">
                      #{pkt.id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {pkt.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-chakra font-bold border ${protoBadge(pkt.protocol)}`}>
                        {pkt.protocol || 'RAW'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-bold whitespace-nowrap">
                      {pkt.source_ip || '0.0.0.0'}{pkt.src_port ? `:${pkt.src_port}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {pkt.dest_ip || '0.0.0.0'}{pkt.dst_port ? `:${pkt.dst_port}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-orbitron">
                      {pkt.length ? `${pkt.length} B` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {pkt.flags ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-900 text-amber-300 font-mono font-bold border border-amber-500/30">
                          {pkt.flags}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate text-[11px]" title={pkt.info}>
                      {pkt.info || 'Standard IP Packet Frame'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPacket(pkt)}
                        className="px-3 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-chakra font-bold tracking-wider transition-all shadow-sm"
                      >
                        Dissect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500 font-mono">
                    No packet events recorded matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/70 border-t border-slate-800 text-xs font-mono text-slate-400 gap-3">
          <div>
            Showing Page <strong className="text-white font-orbitron">{page}</strong> of <strong className="text-white font-orbitron">{totalPages}</strong> ({total} frames captured)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => page > 1 && loadTraffic(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-slate-300 font-orbitron font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => page < totalPages && loadTraffic(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Packet Inspection Modal / Drawer */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#080d1a] border border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.25)] p-7 max-h-[90vh] overflow-y-auto tech-corner-box">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                  <Binary className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-orbitron font-bold text-white">
                    PACKET FRAME DISSECTION #{selectedPacket.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Captured: {selectedPacket.timestamp} • Origin: {selectedPacket.pcap_source || 'Live Capture Stream'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Header Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Protocol</span>
                  <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">{selectedPacket.protocol}</span>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Frame Length</span>
                  <span className="text-sm font-bold font-orbitron text-white mt-1 block">{selectedPacket.length || 0} Bytes</span>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Flags / Bits</span>
                  <span className="text-sm font-bold font-mono text-amber-300 mt-1 block">{selectedPacket.flags || 'None'}</span>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Target Port</span>
                  <span className="text-sm font-bold font-orbitron text-rose-400 mt-1 block">:{selectedPacket.dst_port || 'N/A'}</span>
                </div>
              </div>

              {/* IP Flow */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 font-mono text-xs flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">SOURCE HOST</span>
                  <span className="text-cyan-400 font-bold text-sm mt-0.5 block">{selectedPacket.source_ip}:{selectedPacket.src_port || '0'}</span>
                </div>
                <div className="text-cyan-400 font-bold text-lg px-3">
                  ➔
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">DESTINATION HOST</span>
                  <span className="text-slate-200 font-bold text-sm mt-0.5 block">{selectedPacket.dest_ip}:{selectedPacket.dst_port || '0'}</span>
                </div>
              </div>

              {/* Dissection Info */}
              <div className="space-y-1.5">
                <label className="text-xs font-chakra font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  SCAPY DISSECTION STRING
                </label>
                <div className="p-3.5 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all shadow-inner leading-relaxed">
                  {selectedPacket.info}
                </div>
              </div>

              {/* Raw Payload & Hex Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-chakra font-bold text-slate-300 flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-purple-400" />
                  RAW PAYLOAD / ASCII DUMP
                </label>
                <div className="p-3.5 rounded-2xl bg-black/90 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all max-h-40 overflow-y-auto shadow-inner leading-relaxed">
                  {selectedPacket.raw_payload ? (
                    selectedPacket.raw_payload
                  ) : (
                    <span className="text-slate-600 italic">No application layer ASCII payload in this packet frame header.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-chakra font-bold text-xs tracking-wider transition-all"
              >
                Close Dissection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
