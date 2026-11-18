from nids.models.db import get_db

class AlertModel:
    @staticmethod
    def insert_batch(alerts_data):
        """Batch insert security alerts."""
        if not alerts_data:
            return 0
        db = get_db()
        db.executemany('''
            INSERT INTO alerts (
                timestamp, rule_name, severity, source_ip,
                dest_ip, protocol, port, description, evidence, status, pcap_source
            ) VALUES (
                :timestamp, :rule_name, :severity, :source_ip,
                :dest_ip, :protocol, :port, :description, :evidence, :status, :pcap_source
            )
        ''', alerts_data)
        db.commit()
        return len(alerts_data)

    @staticmethod
    def get_all(limit=100, offset=0, severity=None, status=None, search=None, pcap_source=None):
        db = get_db()
        query = 'SELECT * FROM alerts WHERE 1=1'
        params = []
        
        if severity and severity.upper() != 'ALL':
            query += ' AND severity = ?'
            params.append(severity.title())
            
        if status and status.upper() != 'ALL':
            query += ' AND status = ?'
            params.append(status)
            
        if pcap_source:
            query += ' AND pcap_source = ?'
            params.append(pcap_source)
            
        if search:
            query += ' AND (source_ip LIKE ? OR dest_ip LIKE ? OR rule_name LIKE ? OR description LIKE ?)'
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
            
        query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor = db.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def count(severity=None, status=None, search=None, pcap_source=None):
        db = get_db()
        query = 'SELECT COUNT(*) as total FROM alerts WHERE 1=1'
        params = []
        
        if severity and severity.upper() != 'ALL':
            query += ' AND severity = ?'
            params.append(severity.title())
            
        if status and status.upper() != 'ALL':
            query += ' AND status = ?'
            params.append(status)
            
        if pcap_source:
            query += ' AND pcap_source = ?'
            params.append(pcap_source)
            
        if search:
            query += ' AND (source_ip LIKE ? OR dest_ip LIKE ? OR rule_name LIKE ? OR description LIKE ?)'
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
            
        cursor = db.execute(query, params)
        row = cursor.fetchone()
        return row['total'] if row else 0

    @staticmethod
    def get_severity_breakdown():
        db = get_db()
        cursor = db.execute('''
            SELECT severity, COUNT(*) as count 
            FROM alerts 
            GROUP BY severity
        ''')
        breakdown = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        for row in cursor.fetchall():
            sev = row['severity']
            if sev in breakdown:
                breakdown[sev] = row['count']
        return breakdown

    @staticmethod
    def get_top_attackers(limit=5):
        db = get_db()
        cursor = db.execute('''
            SELECT source_ip, COUNT(*) as count 
            FROM alerts 
            WHERE source_ip IS NOT NULL AND source_ip != ''
            GROUP BY source_ip 
            ORDER BY count DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_recent(limit=10):
        db = get_db()
        cursor = db.execute('''
            SELECT * FROM alerts 
            ORDER BY id DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def update_status(alert_id, new_status):
        db = get_db()
        db.execute('UPDATE alerts SET status = ? WHERE id = ?', (new_status, alert_id))
        db.commit()

    @staticmethod
    def delete(alert_id):
        db = get_db()
        db.execute('DELETE FROM alerts WHERE id = ?', (alert_id,))
        db.commit()

    @staticmethod
    def get_by_id(alert_id):
        db = get_db()
        cursor = db.execute('SELECT * FROM alerts WHERE id = ?', (alert_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def clear_all():
        db = get_db()
        db.execute('DELETE FROM alerts')
        db.commit()
