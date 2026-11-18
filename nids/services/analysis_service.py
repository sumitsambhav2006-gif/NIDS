import os
from flask import current_app
from nids.engine.pcap_reader import PCAPReader
from nids.engine.detection import DetectionEngine
from nids.models.event import EventModel
from nids.models.alert import AlertModel
from nids.models.db import get_db

class AnalysisService:
    @staticmethod
    def get_settings():
        """Retrieve stored system customizations & thresholds."""
        db = get_db()
        cursor = db.execute('SELECT key, value FROM settings')
        settings = {row['key']: row['value'] for row in cursor.fetchall()}
        return settings

    @staticmethod
    def update_settings(new_settings):
        """Update system customizations & thresholds."""
        db = get_db()
        for key, value in new_settings.items():
            db.execute('''
                INSERT INTO settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            ''', (key, str(value)))
        db.commit()
        return True

    @staticmethod
    def process_pcap_file(filepath, original_filename="capture.pcap", max_packets=5000):
        """
        Coordinates full NIDS workflow:
        1. Parse packets from PCAP file using Scapy
        2. Store raw packet events into database
        3. Execute detection engine heuristics & signature rules
        4. Store alerts into database
        5. Return comprehensive result summary
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"PCAP file does not exist: {filepath}")

        # 1. Parse packets
        parsed_packets = PCAPReader.read_pcap(filepath, pcap_name=original_filename, max_packets=max_packets)
        
        # 2. Store events
        if parsed_packets:
            EventModel.insert_batch(parsed_packets)

        # 3. Load active settings & detection thresholds
        db_settings = AnalysisService.get_settings()
        detector = DetectionEngine(config=current_app.config, db_settings=db_settings)

        # 4. Run intrusion detection
        alerts = detector.analyze(parsed_packets, pcap_source=original_filename)

        # 5. Store alerts
        if alerts:
            AlertModel.insert_batch(alerts)

        # 6. Generate summary
        severity_summary = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        for a in alerts:
            sev = a.get('severity', 'Low')
            if sev in severity_summary:
                severity_summary[sev] += 1

        return {
            'filename': original_filename,
            'packet_count': len(parsed_packets),
            'alert_count': len(alerts),
            'severity_summary': severity_summary,
            'alerts': alerts[:15]  # first 15 for instant preview
        }
