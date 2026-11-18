import unittest
import os
import tempfile
from nids import create_app
from nids.models.db import init_db
from nids.engine.detection import DetectionEngine
from nids.engine.packet_analyzer import PacketAnalyzer
from scapy.layers.inet import IP, TCP, ICMP

class TestNIDSEngine(unittest.TestCase):
    def setUp(self):
        self.app = create_app('development')
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_packet_analyzer(self):
        """Test that PacketAnalyzer extracts accurate metadata from Scapy packet."""
        pkt = IP(src="192.168.1.100", dst="192.168.1.1") / TCP(sport=12345, dport=80, flags="S", seq=100)
        analyzed = PacketAnalyzer.analyze_packet(pkt, pcap_source="test.pcap")
        self.assertEqual(analyzed['source_ip'], "192.168.1.100")
        self.assertEqual(analyzed['dest_ip'], "192.168.1.1")
        self.assertEqual(analyzed['protocol'], "HTTP")
        self.assertEqual(analyzed['dst_port'], 80)
        self.assertIn("SYN", analyzed['flags'])

    def test_port_scan_detection(self):
        """Test that DetectionEngine flags port scans over threshold."""
        detector = DetectionEngine(config={'PORT_SCAN_THRESHOLD': 5})
        packets = []
        for port in range(20, 28):  # 8 unique ports > threshold 5
            packets.append({
                'timestamp': '2026-10-28 10:00:00',
                'source_ip': '192.168.1.150',
                'dest_ip': '192.168.1.50',
                'protocol': 'TCP',
                'dst_port': port,
                'flags': 'SYN',
                'info': f'Probe port {port}'
            })
        alerts = detector.analyze(packets, pcap_source="scan.pcap")
        rule_names = [a['rule_name'] for a in alerts]
        self.assertIn('Port Scan Attack', rule_names)

    def test_syn_flood_detection(self):
        """Test that DetectionEngine flags TCP SYN flood attacks."""
        detector = DetectionEngine(config={'SYN_FLOOD_THRESHOLD': 10})
        packets = []
        for i in range(15):  # 15 SYN packets > threshold 10
            packets.append({
                'timestamp': '2026-10-28 10:00:00',
                'source_ip': '10.0.0.99',
                'dest_ip': '192.168.1.10',
                'protocol': 'TCP',
                'dst_port': 80,
                'flags': 'SYN',
                'info': 'SYN flood'
            })
        alerts = detector.analyze(packets, pcap_source="flood.pcap")
        rule_names = [a['rule_name'] for a in alerts]
        self.assertIn('TCP SYN Flood (DoS)', rule_names)

    def test_suspicious_port_detection(self):
        """Test that DetectionEngine flags cleartext and known trojan ports."""
        detector = DetectionEngine()
        packets = [{
            'timestamp': '2026-10-28 10:00:00',
            'source_ip': '192.168.1.200',
            'dest_ip': '192.168.1.5',
            'protocol': 'TCP',
            'dst_port': 23,  # Telnet
            'flags': 'PSH, ACK',
            'info': 'Telnet login attempt'
        }]
        alerts = detector.analyze(packets, pcap_source="telnet.pcap")
        rule_names = [a['rule_name'] for a in alerts]
        self.assertIn('Suspicious Port Access', rule_names)

if __name__ == '__main__':
    unittest.main()
