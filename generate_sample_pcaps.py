import os
from scapy.all import Ether, IP, TCP, UDP, ICMP, DNS, DNSQR, wrpcap

def generate_samples(output_dir="sample_pcaps"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"[*] Generating sample PCAP files in: {output_dir}")

    # 1. Port Scan Attack PCAP
    # Attacker 192.168.1.150 scans ports 20 through 45 on target 192.168.1.50
    port_scan_packets = []
    attacker_ip = "192.168.1.150"
    target_ip = "192.168.1.50"
    for port in range(20, 45):
        pkt = Ether() / IP(src=attacker_ip, dst=target_ip) / TCP(sport=54321, dport=port, flags="S", seq=1000 + port)
        port_scan_packets.append(pkt)
    wrpcap(os.path.join(output_dir, "port_scan_attack.pcap"), port_scan_packets)
    print("  [+] Created: port_scan_attack.pcap (25 ports scanned)")

    # 2. SYN Flood DoS Attack PCAP
    # Attacker 10.0.0.99 floods web server 192.168.1.10:80 with 40 SYN packets
    syn_flood_packets = []
    dos_ip = "10.0.0.99"
    web_ip = "192.168.1.10"
    for i in range(40):
        pkt = Ether() / IP(src=dos_ip, dst=web_ip) / TCP(sport=40000 + i, dport=80, flags="S", seq=5000 + i)
        syn_flood_packets.append(pkt)
    wrpcap(os.path.join(output_dir, "syn_flood_dos.pcap"), syn_flood_packets)
    print("  [+] Created: syn_flood_dos.pcap (40 SYN packets)")

    # 3. ICMP Flood / Ping Sweep PCAP
    # Host 172.16.5.42 sends 30 rapid ICMP Echo Requests
    icmp_packets = []
    ping_ip = "172.16.5.42"
    for i in range(30):
        pkt = Ether() / IP(src=ping_ip, dst="192.168.1.1") / ICMP(type=8, code=0, id=100, seq=i)
        icmp_packets.append(pkt)
    wrpcap(os.path.join(output_dir, "ping_of_death_icmp.pcap"), icmp_packets)
    print("  [+] Created: ping_of_death_icmp.pcap (30 ICMP Echo Requests)")

    # 4. Suspicious & Mixed Traffic (Telnet, Metasploit, DNS Tunnel, Normal HTTP)
    mixed_packets = []
    # Normal HTTP
    for i in range(5):
        mixed_packets.append(Ether() / IP(src="192.168.1.105", dst="93.184.216.34") / TCP(sport=51000 + i, dport=80, flags="PA") / b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n")
    # Telnet cleartext admin attempt (Port 23)
    mixed_packets.append(Ether() / IP(src="192.168.1.200", dst="192.168.1.5") / TCP(sport=49120, dport=23, flags="PA") / b"root\r\n")
    # Metasploit default handler shell connection (Port 4444)
    mixed_packets.append(Ether() / IP(src="192.168.1.200", dst="192.168.1.5") / TCP(sport=49121, dport=4444, flags="S"))
    # Insecure FTP (Port 21)
    mixed_packets.append(Ether() / IP(src="192.168.1.200", dst="192.168.1.5") / TCP(sport=49122, dport=21, flags="PA") / b"USER admin\r\n")
    # DNS Exfiltration / Tunneling query
    long_query = "x9a8f7c6d5e4b3a210fedcba9876543210abcdef998877665544332211.exfil.darkops.internal"
    mixed_packets.append(Ether() / IP(src="192.168.1.110", dst="8.8.8.8") / UDP(sport=53530, dport=53) / DNS(rd=1, qd=DNSQR(qname=long_query)))
    wrpcap(os.path.join(output_dir, "suspicious_traffic.pcap"), mixed_packets)
    print("  [+] Created: suspicious_traffic.pcap (Mixed attacks & telemetry)")
    print("[*] Sample PCAP generation complete!")

if __name__ == '__main__':
    generate_samples()
