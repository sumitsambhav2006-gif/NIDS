import os
import sys
from nids import create_app

def print_banner():
    banner = r"""
  ╔══════════════════════════════════════════════════════════════════════╗
  ║    _   _ ___ ____  ____    ____  ____   ___   ____ ____  _      _   ║
  ║   | \ | |_ _|  _ \/ ___|  / ___|/ ___| / _ \ / ___|___ \/ | ___ / |  ║
  ║   |  \| || || | | \___ \  \___ | |    | | | | |     __) | |/ _ \ | |  ║
  ║   | |\  || || |_| |___) |  ___) | |___ | |_| | |___ / __/| | (_) | |  ║
  ║   |_| \_|___|____/|____/  |____/ \____| \___/ \____|_____|_|\___/|_|  ║
  ║                                                                      ║
  ║       CYBERSHIELD NIDS • REACT + TAILWIND SOC DEFENSE CONSOLE        ║
  ╚══════════════════════════════════════════════════════════════════════╝
    """
    print(banner)
    print("  [+] NIDS Detection Engine: Active & Armed (Scapy 2.8.0)")
    print("  [+] Database Engine: SQLite 3 with WAL Journaling (instance/nids.db)")
    print("  [+] Heuristics: Port Scan, SYN Flood, ICMP Flood, Suspicious Ports, DNS Tunnel")
    print("  [+] Production SOC Console: http://127.0.0.1:5000")
    print("  [+] Vite React Dev Console: http://localhost:5173")
    print("  " + "─" * 68)

if __name__ == '__main__':
    app = create_app('development')
    print_banner()
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='127.0.0.1', port=port, debug=debug_mode, use_reloader=False, threaded=True)
