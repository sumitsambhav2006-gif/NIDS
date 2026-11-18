from datetime import datetime
from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.inet6 import IPv6
from scapy.layers.l2 import Ether, ARP
from scapy.layers.dns import DNS, DNSQR

class PacketAnalyzer:
    @staticmethod
    def analyze_packet(packet, pcap_source="upload"):
        """Extract structured metadata from a Scapy packet."""
        try:
            # Timestamp
            pkt_time = float(packet.time) if hasattr(packet, 'time') else datetime.now().timestamp()
            dt = datetime.fromtimestamp(pkt_time)
            timestamp_str = dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        except Exception:
            timestamp_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S.000')

        length = len(packet)
        source_ip = "Unknown"
        dest_ip = "Unknown"
        protocol = "Other"
        src_port = None
        dst_port = None
        flags = ""
        info = ""
        raw_payload = ""

        # IP Layer
        if packet.haslayer(IP):
            source_ip = packet[IP].src
            dest_ip = packet[IP].dst
            protocol = packet[IP].proto
            # Translate common IP proto numbers
            proto_map = {1: 'ICMP', 6: 'TCP', 17: 'UDP'}
            protocol = proto_map.get(protocol, f"IP-{protocol}")
        elif packet.haslayer(IPv6):
            source_ip = packet[IPv6].src
            dest_ip = packet[IPv6].dst
            protocol = "IPv6"
        elif packet.haslayer(ARP):
            source_ip = packet[ARP].psrc
            dest_ip = packet[ARP].pdst
            protocol = "ARP"
            op = "Request" if packet[ARP].op == 1 else "Reply"
            info = f"ARP {op} who-has {dest_ip} tell {source_ip}"

        # TCP Layer
        if packet.haslayer(TCP):
            protocol = "TCP"
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
            # Flags
            tcp_flags = packet[TCP].flags
            flag_str = str(tcp_flags)
            flag_names = []
            if 'S' in flag_str: flag_names.append('SYN')
            if 'A' in flag_str: flag_names.append('ACK')
            if 'F' in flag_str: flag_names.append('FIN')
            if 'R' in flag_str: flag_names.append('RST')
            if 'P' in flag_str: flag_names.append('PSH')
            if 'U' in flag_str: flag_names.append('URG')
            flags = ', '.join(flag_names) if flag_names else flag_str

            info = f"{src_port} -> {dst_port} [{flags}] Seq={packet[TCP].seq}"
            
            # Application layer hints
            if dst_port == 80 or src_port == 80:
                protocol = "HTTP"
            elif dst_port == 443 or src_port == 443:
                protocol = "HTTPS/TLS"
            elif dst_port == 21 or src_port == 21:
                protocol = "FTP"
            elif dst_port == 22 or src_port == 22:
                protocol = "SSH"
            elif dst_port == 23 or src_port == 23:
                protocol = "TELNET"

        # UDP Layer
        elif packet.haslayer(UDP):
            protocol = "UDP"
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport
            info = f"{src_port} -> {dst_port} Len={packet[UDP].len}"

            if packet.haslayer(DNS):
                protocol = "DNS"
                if packet[DNS].qr == 0:
                    qname = packet[DNSQR].qname.decode('utf-8', errors='ignore') if packet.haslayer(DNSQR) else ""
                    info = f"Standard query A {qname}"
                else:
                    info = "Standard query response"

        # ICMP Layer
        elif packet.haslayer(ICMP):
            protocol = "ICMP"
            icmp_type = packet[ICMP].type
            icmp_code = packet[ICMP].code
            type_desc = {8: "Echo Request (Ping)", 0: "Echo Reply", 3: "Destination Unreachable"}
            info = f"{type_desc.get(icmp_type, f'Type {icmp_type}')} (Code {icmp_code})"

        # Payload Hex/ASCII Preview (up to 128 bytes)
        try:
            payload_bytes = bytes(packet.payload)
            if payload_bytes:
                hex_str = payload_bytes[:64].hex(' ')
                ascii_str = ''.join([chr(b) if 32 <= b <= 126 else '.' for b in payload_bytes[:64]])
                raw_payload = f"HEX: {hex_str}\nASCII: {ascii_str}"
        except Exception:
            raw_payload = ""

        if not info:
            info = f"{protocol} Packet, Length {length} bytes"

        return {
            'timestamp': timestamp_str,
            'source_ip': source_ip,
            'dest_ip': dest_ip,
            'protocol': protocol,
            'src_port': src_port,
            'dst_port': dst_port,
            'length': length,
            'flags': flags,
            'info': info,
            'pcap_source': pcap_source,
            'raw_payload': raw_payload
        }
