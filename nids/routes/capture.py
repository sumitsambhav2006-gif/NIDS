import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from nids.services.analysis_service import AnalysisService
from nids.engine.detection import DetectionEngine
from nids.models.event import EventModel
from nids.models.alert import AlertModel

capture_bp = Blueprint('capture', __name__)

SAMPLE_INFO = {
    'port_scan_attack.pcap': {
        'title': 'Port Scan Reconnaissance',
        'type': 'Port Scan',
        'severity': 'Critical',
        'description': 'Attacker 192.168.1.150 scans 25 consecutive TCP ports on 192.168.1.50 using SYN stealth packets.'
    },
    'syn_flood_dos.pcap': {
        'title': 'SYN Flood DoS Attack',
        'type': 'Denial of Service',
        'severity': 'Critical',
        'description': 'Attacker 10.0.0.99 floods web server port 80 with 40 rapid TCP SYN packets to exhaust connection table.'
    },
    'ping_of_death_icmp.pcap': {
        'title': 'ICMP Echo Flood / Ping Sweep',
        'type': 'ICMP Flood',
        'severity': 'High',
        'description': 'Host 172.16.5.42 launches 30 high-frequency ICMP Echo requests targeting network gateway 192.168.1.1.'
    },
    'suspicious_traffic.pcap': {
        'title': 'C2 Botnet & Remote Backdoors',
        'type': 'Multi-vector Threat',
        'severity': 'Critical',
        'description': 'Contains Metasploit port 4444 handler, cleartext Telnet port 23 admin logon, and DNS data exfiltration.'
    }
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@capture_bp.route('/api/samples', methods=['GET'])
@capture_bp.route('/api/sample-pcaps', methods=['GET'])
def get_sample_pcaps():
    sample_dir = current_app.config['SAMPLE_PCAPS_FOLDER']
    samples_list = []
    if os.path.exists(sample_dir):
        for f in os.listdir(sample_dir):
            if f.endswith(('.pcap', '.cap', '.pcapng')):
                fpath = os.path.join(sample_dir, f)
                size_bytes = os.path.getsize(fpath)
                meta = SAMPLE_INFO.get(f, {
                    'title': f.replace('.pcap', '').replace('_', ' ').title(),
                    'type': 'Network Capture',
                    'severity': 'Medium',
                    'description': 'Synthetic PCAP network traffic capture sample.'
                })
                samples_list.append({
                    'filename': f,
                    'filesize': f"{size_bytes / 1024:.1f} KB",
                    'size_bytes': size_bytes,
                    'title': meta['title'],
                    'type': meta['type'],
                    'severity': meta['severity'],
                    'description': meta['description']
                })
    return jsonify({'success': True, 'samples': samples_list})

@capture_bp.route('/api/upload', methods=['POST'])
def handle_upload():
    if 'pcap_file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part provided'}), 400

    file = request.files['pcap_file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)

        try:
            result = AnalysisService.process_pcap_file(filepath, original_filename=filename)
            return jsonify({
                'success': True,
                'message': f"Successfully analyzed {result['packet_count']} packets and found {result['alert_count']} alerts.",
                'data': result
            })
        except Exception as e:
            return jsonify({'success': False, 'error': f"Analysis error: {str(e)}"}), 500
    else:
        return jsonify({'success': False, 'error': 'Invalid file format. Please upload .pcap, .pcapng or .cap'}), 400

@capture_bp.route('/api/load-sample/<sample_name>', methods=['POST'])
def load_sample(sample_name):
    sample_dir = current_app.config['SAMPLE_PCAPS_FOLDER']
    safe_name = secure_filename(sample_name)
    filepath = os.path.join(sample_dir, safe_name)

    if not os.path.exists(filepath):
        return jsonify({'success': False, 'error': f"Sample PCAP '{sample_name}' not found."}), 404

    try:
        result = AnalysisService.process_pcap_file(filepath, original_filename=safe_name)
        return jsonify({
            'success': True,
            'message': f"Sample '{safe_name}' analyzed successfully! Parsed {result['packet_count']} packets, {result['alert_count']} alerts detected.",
            'data': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f"Failed to analyze sample: {str(e)}"}), 500

@capture_bp.route('/api/simulate-attack', methods=['POST'])
def simulate_attack():
    req_data = request.get_json() or {}
    attack_type = req_data.get('attack_type', 'port_scan').lower()
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    parsed_packets = []
    source_name = f"live_sim_{attack_type}.pcap"

    if attack_type == 'port_scan':
        attacker_ip = req_data.get('attacker_ip', '192.168.1.189')
        target_ip = req_data.get('target_ip', '192.168.1.10')
        count = int(req_data.get('count', 25))
        for p in range(20, 20 + count):
            parsed_packets.append({
                'timestamp': now_str,
                'source_ip': attacker_ip,
                'dest_ip': target_ip,
                'protocol': 'TCP',
                'src_port': 52100,
                'dst_port': p,
                'length': 60,
                'flags': 'SYN',
                'info': f"52100 -> {p} [SYN] Seq=100{p}",
                'pcap_source': source_name,
                'raw_payload': ''
            })

    elif attack_type == 'syn_flood':
        attacker_ip = req_data.get('attacker_ip', '10.0.8.44')
        target_ip = req_data.get('target_ip', '192.168.1.10')
        target_port = int(req_data.get('target_port', 80))
        count = int(req_data.get('count', 35))
        for i in range(count):
            parsed_packets.append({
                'timestamp': now_str,
                'source_ip': attacker_ip,
                'dest_ip': target_ip,
                'protocol': 'TCP',
                'src_port': 41000 + i,
                'dst_port': target_port,
                'length': 60,
                'flags': 'SYN',
                'info': f"{41000 + i} -> {target_port} [SYN] Seq=990{i}",
                'pcap_source': source_name,
                'raw_payload': ''
            })

    elif attack_type == 'icmp_flood':
        attacker_ip = req_data.get('attacker_ip', '172.16.88.21')
        target_ip = req_data.get('target_ip', '192.168.1.1')
        count = int(req_data.get('count', 25))
        for i in range(count):
            parsed_packets.append({
                'timestamp': now_str,
                'source_ip': attacker_ip,
                'dest_ip': target_ip,
                'protocol': 'ICMP',
                'src_port': None,
                'dst_port': None,
                'length': 98,
                'flags': '',
                'info': f"Echo (ping) request id=0x00{i:02x} seq={i}",
                'pcap_source': source_name,
                'raw_payload': ''
            })

    elif attack_type == 'suspicious_ports':
        attacker_ip = req_data.get('attacker_ip', '185.220.101.5')
        target_ip = req_data.get('target_ip', '192.168.1.5')
        ports = [4444, 23, 21, 31337]
        for p in ports:
            parsed_packets.append({
                'timestamp': now_str,
                'source_ip': attacker_ip,
                'dest_ip': target_ip,
                'protocol': 'TCP',
                'src_port': 59100,
                'dst_port': p,
                'length': 74,
                'flags': 'SYN',
                'info': f"59100 -> {p} [SYN] Suspicious shell probe",
                'pcap_source': source_name,
                'raw_payload': 'CMD /bin/sh'
            })

    elif attack_type == 'dns_tunnel':
        attacker_ip = req_data.get('attacker_ip', '192.168.1.75')
        target_ip = '8.8.8.8'
        parsed_packets.append({
            'timestamp': now_str,
            'source_ip': attacker_ip,
            'dest_ip': target_ip,
            'protocol': 'DNS',
            'src_port': 53531,
            'dst_port': 53,
            'length': 188,
            'flags': '',
            'info': "Standard query A 9a8b7c6d5e4f3a2b1c0d.exfiltrated-secret.c2server.org",
            'pcap_source': source_name,
            'raw_payload': '9a8b7c6d5e4f3a2b1c0d.exfiltrated-secret.c2server.org'
        })

    else:
        return jsonify({'success': False, 'error': f"Unknown attack type: {attack_type}"}), 400

    # Store packet events in database
    if parsed_packets:
        EventModel.insert_batch(parsed_packets)

    # Run detection engine
    db_settings = AnalysisService.get_settings()
    detector = DetectionEngine(config=current_app.config, db_settings=db_settings)
    alerts = detector.analyze(parsed_packets, pcap_source=source_name)

    if alerts:
        AlertModel.insert_batch(alerts)

    return jsonify({
        'success': True,
        'message': f"Simulated {attack_type.replace('_', ' ').upper()} successfully! Injected {len(parsed_packets)} packets, triggered {len(alerts)} alerts.",
        'attack_type': attack_type,
        'packet_count': len(parsed_packets),
        'alert_count': len(alerts),
        'alerts': alerts
    })
