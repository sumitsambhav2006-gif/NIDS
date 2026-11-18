from collections import defaultdict
from datetime import datetime

class DetectionEngine:
    def __init__(self, config=None, db_settings=None):
        self.config = config or {}
        self.db_settings = db_settings or {}
        
        # Load configurable thresholds
        self.port_scan_threshold = int(self.db_settings.get(
            'port_scan_threshold', self.config.get('PORT_SCAN_THRESHOLD', 10)
        ))
        self.syn_flood_threshold = int(self.db_settings.get(
            'syn_flood_threshold', self.config.get('SYN_FLOOD_THRESHOLD', 20)
        ))
        self.icmp_flood_threshold = int(self.db_settings.get(
            'icmp_flood_threshold', self.config.get('ICMP_FLOOD_THRESHOLD', 15)
        ))

        # Rule toggles
        self.rule_port_scan_enabled = self.db_settings.get('rule_port_scan_enabled', 'true') == 'true'
        self.rule_syn_flood_enabled = self.db_settings.get('rule_syn_flood_enabled', 'true') == 'true'
        self.rule_icmp_flood_enabled = self.db_settings.get('rule_icmp_flood_enabled', 'true') == 'true'
        self.rule_suspicious_ports_enabled = self.db_settings.get('rule_suspicious_ports_enabled', 'true') == 'true'
        self.rule_dns_tunnel_enabled = self.db_settings.get('rule_dns_tunnel_enabled', 'true') == 'true'

        self.suspicious_ports = self.config.get('SUSPICIOUS_PORTS', {
            21: 'FTP (Cleartext Credentials)',
            23: 'Telnet (Unencrypted Remote Shell)',
            4444: 'Metasploit Default Listener',
            5555: 'Android ADB Remote Bridge',
            6667: 'IRC Botnet C2 Channel',
            31337: 'BackOrifice / Elite Trojan'
        })

    def analyze(self, packets, pcap_source="uploaded.pcap"):
        """
        Runs all active intrusion detection rules over the analyzed packets.
        Returns a list of structured alert dictionaries.
        """
        alerts = []
        if not packets:
            return alerts

        # Aggregation state for heuristics
        # src_ip -> set of (dest_ip, dst_port)
        port_scan_tracker = defaultdict(lambda: defaultdict(set))
        # (src_ip, dest_ip, dst_port) -> count of SYN packets
        syn_tracker = defaultdict(int)
        # src_ip -> count of ICMP echo requests
        icmp_tracker = defaultdict(int)
        # Tracking first timestamp
        ip_timestamps = {}

        for pkt in packets:
            src = pkt.get('source_ip', 'Unknown')
            dst = pkt.get('dest_ip', 'Unknown')
            proto = pkt.get('protocol', '')
            dst_port = pkt.get('dst_port')
            flags = pkt.get('flags', '')
            info = pkt.get('info', '')
            tstamp = pkt.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

            if src not in ip_timestamps:
                ip_timestamps[src] = tstamp

            # 1. Suspicious / Insecure Ports Detection
            if self.rule_suspicious_ports_enabled and dst_port in self.suspicious_ports:
                service_info = self.suspicious_ports[dst_port]
                alerts.append({
                    'timestamp': tstamp,
                    'rule_name': 'Suspicious Port Access',
                    'severity': 'High' if dst_port in [4444, 31337, 23] else 'Medium',
                    'source_ip': src,
                    'dest_ip': dst,
                    'protocol': proto,
                    'port': dst_port,
                    'description': f"Traffic detected targeting {service_info} on port {dst_port}.",
                    'evidence': f"Packet: {info}",
                    'status': 'Open',
                    'pcap_source': pcap_source
                })

            # 2. Stealth Scans: NULL and XMAS scans
            if 'TCP' in proto and flags:
                flag_set = set(f.strip() for f in flags.split(','))
                if not flag_set or flags == '0':
                    alerts.append({
                        'timestamp': tstamp,
                        'rule_name': 'TCP NULL Scan',
                        'severity': 'High',
                        'source_ip': src,
                        'dest_ip': dst,
                        'protocol': 'TCP',
                        'port': dst_port,
                        'description': 'Stealth NULL scan detected (TCP packet with no flags set).',
                        'evidence': f"Target port: {dst_port}, Flags: {flags}",
                        'status': 'Open',
                        'pcap_source': pcap_source
                    })
                elif 'FIN' in flag_set and 'PSH' in flag_set and 'URG' in flag_set:
                    alerts.append({
                        'timestamp': tstamp,
                        'rule_name': 'TCP XMAS Scan',
                        'severity': 'High',
                        'source_ip': src,
                        'dest_ip': dst,
                        'protocol': 'TCP',
                        'port': dst_port,
                        'description': 'Stealth XMAS scan detected (FIN, PSH, and URG flags set simultaneously).',
                        'evidence': f"Target port: {dst_port}, Flags: {flags}",
                        'status': 'Open',
                        'pcap_source': pcap_source
                    })

            # 3. Aggregate for Port Scan Detection
            if self.rule_port_scan_enabled and dst_port and src != 'Unknown':
                port_scan_tracker[src][dst].add(dst_port)

            # 4. Aggregate for SYN Flood (DoS)
            if self.rule_syn_flood_enabled and 'SYN' in flags and 'ACK' not in flags:
                syn_tracker[(src, dst, dst_port)] += 1

            # 5. Aggregate for ICMP Flood / Ping Sweep
            if self.rule_icmp_flood_enabled and 'ICMP' in proto:
                if 'Echo Request' in info or 'Type 8' in info:
                    icmp_tracker[src] += 1

            # 6. DNS Tunneling / Exfiltration Suspicion
            if self.rule_dns_tunnel_enabled and proto == 'DNS' and 'Standard query A' in info:
                domain_part = info.replace('Standard query A', '').strip()
                if len(domain_part) > 45:
                    alerts.append({
                        'timestamp': tstamp,
                        'rule_name': 'Suspicious DNS Query / Tunneling',
                        'severity': 'High',
                        'source_ip': src,
                        'dest_ip': dst,
                        'protocol': 'DNS',
                        'port': 53,
                        'description': f"Anomalously long DNS query length ({len(domain_part)} chars) detected. Possible data exfiltration tunnel.",
                        'evidence': f"Query: {domain_part[:80]}...",
                        'status': 'Open',
                        'pcap_source': pcap_source
                    })

        # Post-processing heuristics: Port Scan Rule Evaluation
        if self.rule_port_scan_enabled:
            for src_ip, targets in port_scan_tracker.items():
                for dst_ip, ports in targets.items():
                    if len(ports) >= self.port_scan_threshold:
                        sample_ports = sorted(list(ports))[:10]
                        sample_str = ', '.join(map(str, sample_ports))
                        if len(ports) > 10:
                            sample_str += f"... (+{len(ports)-10} more)"
                        alerts.append({
                            'timestamp': ip_timestamps.get(src_ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                            'rule_name': 'Port Scan Attack',
                            'severity': 'High',
                            'source_ip': src_ip,
                            'dest_ip': dst_ip,
                            'protocol': 'TCP/UDP',
                            'port': None,
                            'description': f"Host scanned {len(ports)} distinct ports on target {dst_ip} (Threshold: {self.port_scan_threshold}).",
                            'evidence': f"Targeted ports: {sample_str}",
                            'status': 'Open',
                            'pcap_source': pcap_source
                        })

        # Post-processing heuristics: SYN Flood Rule Evaluation
        if self.rule_syn_flood_enabled:
            for (src_ip, dst_ip, target_port), count in syn_tracker.items():
                if count >= self.syn_flood_threshold:
                    alerts.append({
                        'timestamp': ip_timestamps.get(src_ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                        'rule_name': 'TCP SYN Flood (DoS)',
                        'severity': 'Critical',
                        'source_ip': src_ip,
                        'dest_ip': dst_ip,
                        'protocol': 'TCP',
                        'port': target_port,
                        'description': f"Disproportionate burst of {count} TCP SYN packets with no handshake completion targeting port {target_port}.",
                        'evidence': f"SYN packet count: {count} >= threshold {self.syn_flood_threshold}",
                        'status': 'Open',
                        'pcap_source': pcap_source
                    })

        # Post-processing heuristics: ICMP Flood Rule Evaluation
        if self.rule_icmp_flood_enabled:
            for src_ip, count in icmp_tracker.items():
                if count >= self.icmp_flood_threshold:
                    alerts.append({
                        'timestamp': ip_timestamps.get(src_ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                        'rule_name': 'ICMP Flood / Ping Sweep',
                        'severity': 'Medium',
                        'source_ip': src_ip,
                        'dest_ip': 'Multiple / Broadcast',
                        'protocol': 'ICMP',
                        'port': None,
                        'description': f"Abnormal burst of {count} ICMP echo requests originating from host {src_ip}.",
                        'evidence': f"ICMP count: {count} >= threshold {self.icmp_flood_threshold}",
                        'status': 'Open',
                        'pcap_source': pcap_source
                    })

        return alerts
