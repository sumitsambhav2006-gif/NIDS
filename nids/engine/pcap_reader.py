import os
from scapy.all import rdpcap, PcapReader
from nids.engine.packet_analyzer import PacketAnalyzer

class PCAPReader:
    @staticmethod
    def read_pcap(filepath, pcap_name="uploaded.pcap", max_packets=5000):
        """
        Reads a PCAP file and returns a list of parsed packet metadata dictionaries.
        Supports .pcap, .pcapng, and .cap files.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"PCAP file not found: {filepath}")

        parsed_packets = []
        try:
            # Using PcapReader iterator to avoid reading massive files entirely into RAM
            with PcapReader(filepath) as pcap_reader:
                for i, pkt in enumerate(pcap_reader):
                    if max_packets and i >= max_packets:
                        break
                    analyzed = PacketAnalyzer.analyze_packet(pkt, pcap_source=pcap_name)
                    parsed_packets.append(analyzed)
        except Exception as e:
            # Fallback to rdpcap if PcapReader encounters format issues
            try:
                packets = rdpcap(filepath)
                for i, pkt in enumerate(packets):
                    if max_packets and i >= max_packets:
                        break
                    analyzed = PacketAnalyzer.analyze_packet(pkt, pcap_source=pcap_name)
                    parsed_packets.append(analyzed)
            except Exception as inner_e:
                raise RuntimeError(f"Failed to read PCAP: {str(e)} / {str(inner_e)}")

        return parsed_packets
