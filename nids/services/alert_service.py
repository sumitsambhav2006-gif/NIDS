import io
import csv
import json
from nids.models.alert import AlertModel
from nids.models.event import EventModel
from nids.models.db import get_db

class AlertService:
    @staticmethod
    def get_dashboard_summary():
        """Aggregates all metrics needed for the main SOC dashboard."""
        total_packets = EventModel.count()
        total_alerts = AlertModel.count()
        severity_counts = AlertModel.get_severity_breakdown()
        protocol_dist = EventModel.get_protocol_distribution()
        top_ports = EventModel.get_top_ports(limit=6)
        top_attackers = AlertModel.get_top_attackers(limit=5)
        recent_alerts = AlertModel.get_recent(limit=8)
        traffic_timeline = EventModel.get_traffic_timeline(limit=20)

        # Threat posture calculation
        if severity_counts['Critical'] > 0:
            posture = {'level': 'CRITICAL THREAT DETECTED', 'badge_class': 'badge-critical', 'score': 95}
        elif severity_counts['High'] > 0:
            posture = {'level': 'HIGH ALERT ELEVATED', 'badge_class': 'badge-high', 'score': 75}
        elif severity_counts['Medium'] > 0:
            posture = {'level': 'GUARDED / ANOMALIES', 'badge_class': 'badge-medium', 'score': 45}
        elif total_alerts > 0:
            posture = {'level': 'LOW RISK MONITORED', 'badge_class': 'badge-low', 'score': 20}
        else:
            posture = {'level': 'ALL SYSTEMS SECURE', 'badge_class': 'badge-safe', 'score': 5}

        return {
            'total_packets': total_packets,
            'total_alerts': total_alerts,
            'severity': severity_counts,
            'protocol_distribution': protocol_dist,
            'top_ports': top_ports,
            'top_attackers': top_attackers,
            'recent_alerts': recent_alerts,
            'traffic_timeline': traffic_timeline,
            'threat_posture': posture
        }

    @staticmethod
    def get_alerts(page=1, per_page=20, severity=None, status=None, search=None, pcap_source=None):
        offset = (page - 1) * per_page
        alerts = AlertModel.get_all(limit=per_page, offset=offset, severity=severity, status=status, search=search, pcap_source=pcap_source)
        total = AlertModel.count(severity=severity, status=status, search=search, pcap_source=pcap_source)
        total_pages = max(1, (total + per_page - 1) // per_page)
        return {
            'alerts': alerts,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages
        }

    @staticmethod
    def get_alert_by_id(alert_id):
        return AlertModel.get_by_id(alert_id)

    @staticmethod
    def update_alert_status(alert_id, new_status):
        AlertModel.update_status(alert_id, new_status)
        return True

    @staticmethod
    def delete_alert(alert_id):
        AlertModel.delete(alert_id)
        return True

    @staticmethod
    def clear_all():
        AlertModel.clear_all()
        EventModel.clear_all()
        return True

    @staticmethod
    def export_alerts_csv():
        alerts = AlertModel.get_all(limit=10000, offset=0)
        output = io.StringIO()
        fieldnames = ['id', 'timestamp', 'rule_name', 'severity', 'source_ip', 'dest_ip', 'protocol', 'port', 'description', 'evidence', 'status', 'pcap_source']
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for alert in alerts:
            writer.writerow({k: alert.get(k, '') for k in fieldnames})
        return output.getvalue()

    @staticmethod
    def export_alerts_json():
        alerts = AlertModel.get_all(limit=10000, offset=0)
        return json.dumps(alerts, indent=2)
