# 🛡️ CYBERSHIELD NIDS — Full-Stack Network Intrusion Detection System & SOC Console

A modern, high-performance, full-stack **Network Intrusion Detection System (NIDS)** and **Security Operations Center (SOC) Console** built with:
- 🐍 **Python 3 & Flask** (REST API & Scapy 2.8 Heuristic Packet Engine)
- 🗄️ **SQLite 3** (`instance/nids.db` with WAL Journaling for low-latency concurrent queries)
- ⚛️ **React 19 & Vite** (Modular, reactive Single-Page Application)
- 🎨 **Tailwind CSS v4** (High-tech cyber aesthetic, glassmorphism, glowing telemetry HUD, animations)

---

## 🌟 Architecture & Features

### 1. ⚛️ Modern React + Tailwind CSS SOC Interface (`frontend/`)
- **SOC Executive Dashboard**:
  - **Dynamic Threat Posture HUD**: Live risk meter (0-100%) and defense condition indicators (*Critical Threat Detected*, *Elevated*, *All Systems Secure*).
  - **Packet Traffic Velocity Timeline**: Custom SVG area chart with real-time intensity visualization.
  - **Protocol Distribution Breakdown**: Interactive protocol proportions (TCP, UDP, ICMP, DNS, HTTP, FTP).
  - **Aggressive Attacker Rankings & Targeted Ports**: Highlights top malicious IPs and high-risk service ports.
  - **Chronological Incident Feed**: Live stream of incoming threats with 1-click forensic analysis.
- **Threats & Alerts Center**:
  - Filter by severity (*Critical*, *High*, *Medium*, *Low*), status (*Open*, *Investigating*, *Resolved*, *False Positive*), or text search.
  - Export incidents to **CSV** and **JSON**.
  - Deep Forensic Inspection Drawer with packet dissection, artifact evidence, and auto-generated firewall (`iptables`) block commands.
- **Packet Inspector (Wireshark-style stream)**:
  - Dissect individual captured packets, protocol layer stacks, flags, and raw ASCII/Hex payloads.
- **PCAP Capture & Live Attack Simulator**:
  - Drag-and-drop ingestion of custom `.pcap`, `.pcapng`, `.cap` captures.
  - 1-click curated attack benchmarks (`port_scan_attack.pcap`, `syn_flood_dos.pcap`, `ping_of_death_icmp.pcap`, `suspicious_traffic.pcap`).
  - **Live Synthetic Attack Range**: Inject custom attack streams on the fly to test Scapy heuristics in real-time.
- **Detection Rules & SOC Config**:
  - Calibrate heuristic thresholds (Port scan packet threshold, SYN flood threshold, ICMP flood threshold).
  - Toggle individual intrusion detection modules.
  - Synthesized Web Audio alerts (zero external audio dependencies).
  - Database wipe and reset tools.

---

### 2. 🐍 Python Heuristic Detection Engine & SQLite
- **Heuristics & Signatures**:
  - 🔴 **Port Scan Reconnaissance**: Detects multi-port probes across TCP ports.
  - ⚡ **TCP SYN Flood (DoS)**: Flags rapid half-open connection exhaustion bursts.
  - 💥 **ICMP Echo Flood**: Detects ping storms and echo sweep anomalies.
  - 🕵️ **Suspicious Ports & Shells**: Flags Metasploit handler (4444), Telnet (23), FTP (21), ADB (5555), and Trojan backdoors (31337).
  - 📡 **DNS Tunneling & Exfiltration**: Detects covert data exfiltration over oversized DNS queries.
- **SQLite Database (`instance/nids.db`)**:
  - Tables: `events` (packets), `alerts` (detections), `settings` (thresholds & toggles).
  - Indexed for fast retrieval and pagination.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install Python backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Run the Application

#### Option A: Production / Direct Run (Single Server)
```bash
# Build React frontend
npm run build

# Start Flask Backend (serves both React SPA and REST APIs on port 5000)
python run.py
```
👉 Open **http://127.0.0.1:5000** in your browser!

#### Option B: Full-Stack Dev Mode (Hot-Reload)
In Terminal 1 (Backend):
```bash
python run.py
```

In Terminal 2 (React Vite Dev Server):
```bash
npm run dev
```
👉 Open **http://localhost:5173** (Vite proxies all API calls automatically to Flask on port 5000).

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/stats` | `GET` | Aggregated dashboard metrics, threat posture, timeline, and charts |
| `/api/alerts` | `GET` | Filtered, searchable, paginated alerts list |
| `/alerts/api/<id>/status` | `POST` | Update alert triage status (`Open`, `Investigating`, `Resolved`) |
| `/alerts/api/<id>` | `DELETE` | Delete specific alert record |
| `/api/alerts/clear` | `POST` | Wipe all alerts and traffic events from SQLite |
| `/alerts/export/csv` | `GET` | Export all alerts in CSV format |
| `/alerts/export/json` | `GET` | Export all alerts in JSON format |
| `/api/traffic` | `GET` | Paginated packet event stream with protocol and search filters |
| `/api/traffic/<id>` | `GET` | Single packet frame details and raw payload |
| `/api/samples` | `GET` | List available curated benchmark sample PCAPs |
| `/api/load-sample/<name>` | `POST` | Analyze pre-packaged sample PCAP |
| `/api/upload` | `POST` | Upload and analyze `.pcap` file |
| `/api/simulate-attack` | `POST` | Live synthetic packet generator & intrusion trigger |
| `/api/settings` | `GET`, `POST` | Read or save detection rules and threshold configurations |

---

## 📁 Directory Structure

```
d:/cybersecurity NIDS/
├── frontend/                     # React 19 + Tailwind CSS v4 Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Top command bar, threat HUD, controls
│   │   │   ├── DashboardView.jsx # Threat posture, charts, top attackers, live feed
│   │   │   ├── AlertsView.jsx    # Incident table, filters, CSV/JSON export
│   │   │   ├── TrafficView.jsx   # Packet inspector, protocol filters, payload modal
│   │   │   ├── CaptureView.jsx   # PCAP upload, sample loader, attack simulator
│   │   │   ├── SettingsView.jsx  # Rule toggles, threshold calibration, reset
│   │   │   ├── AlertDetailModal.jsx # Forensic alert drawer & iptables mitigation
│   │   │   └── SimulateModal.jsx # Quick attack injector modal
│   │   ├── utils/
│   │   │   ├── api.js            # Unified REST client
│   │   │   └── audio.js          # Web Audio API cyber synth sound effects
│   │   ├── App.jsx               # Root React application
│   │   └── index.css             # Tailwind v4 theme, radar & cyber glow styles
│   └── dist/                     # Optimized production bundle
│
├── nids/                         # Python NIDS Backend Package
│   ├── engine/
│   │   ├── packet_analyzer.py    # Scapy packet feature extractor
│   │   ├── pcap_reader.py        # Streamed PCAP parser
│   │   └── detection.py          # Port scan, SYN flood, ICMP, DNS heuristics
│   ├── models/
│   │   ├── db.py                 # SQLite database initialization & WAL mode
│   │   ├── alert.py              # Security alerts queries & aggregations
│   │   └── event.py              # Packet telemetry event model
│   ├── routes/
│   │   ├── dashboard.py          # Dashboard endpoints & React SPA serving
│   │   ├── alerts.py             # Alerts API, status triage, CSV/JSON export
│   │   ├── capture.py            # Upload, benchmark samples, attack simulator
│   │   ├── traffic.py            # Traffic event stream API & packet details
│   │   └── settings.py           # Engine configuration API
│   └── services/
│       ├── alert_service.py      # SOC metric aggregation service
│       └── analysis_service.py   # Analysis workflow coordinator
│
├── instance/
│   └── nids.db                   # SQLite Database
├── sample_pcaps/                 # Benchmark PCAPs for 1-click evaluation
├── uploads/                      # Uploaded PCAP directory
├── run.py                        # Application entry point
├── requirements.txt              # Python requirements
└── package.json                  # Root npm scripts
```
