from nids.models.db import get_db

class EventModel:
    @staticmethod
    def insert_batch(events_data):
        """Batch insert captured packet events for performance."""
        if not events_data:
            return 0
        db = get_db()
        db.executemany('''
            INSERT INTO events (
                timestamp, source_ip, dest_ip, protocol,
                src_port, dst_port, length, flags, info, pcap_source, raw_payload
            ) VALUES (
                :timestamp, :source_ip, :dest_ip, :protocol,
                :src_port, :dst_port, :length, :flags, :info, :pcap_source, :raw_payload
            )
        ''', events_data)
        db.commit()
        return len(events_data)

    @staticmethod
    def get_all(limit=100, offset=0, protocol=None, search=None, pcap_source=None):
        db = get_db()
        query = 'SELECT * FROM events WHERE 1=1'
        params = []
        
        if protocol and protocol.upper() != 'ALL':
            query += ' AND protocol = ?'
            params.append(protocol.upper())
            
        if pcap_source:
            query += ' AND pcap_source = ?'
            params.append(pcap_source)
            
        if search:
            query += ' AND (source_ip LIKE ? OR dest_ip LIKE ? OR info LIKE ?)'
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
            
        query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor = db.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def count(protocol=None, search=None, pcap_source=None):
        db = get_db()
        query = 'SELECT COUNT(*) as total FROM events WHERE 1=1'
        params = []
        
        if protocol and protocol.upper() != 'ALL':
            query += ' AND protocol = ?'
            params.append(protocol.upper())
            
        if pcap_source:
            query += ' AND pcap_source = ?'
            params.append(pcap_source)
            
        if search:
            query += ' AND (source_ip LIKE ? OR dest_ip LIKE ? OR info LIKE ?)'
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
            
        cursor = db.execute(query, params)
        row = cursor.fetchone()
        return row['total'] if row else 0

    @staticmethod
    def get_protocol_distribution():
        db = get_db()
        cursor = db.execute('''
            SELECT protocol, COUNT(*) as count 
            FROM events 
            GROUP BY protocol 
            ORDER BY count DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_top_ports(limit=5):
        db = get_db()
        cursor = db.execute('''
            SELECT dst_port, COUNT(*) as count 
            FROM events 
            WHERE dst_port IS NOT NULL AND dst_port > 0
            GROUP BY dst_port 
            ORDER BY count DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_traffic_timeline(limit=30):
        db = get_db()
        cursor = db.execute('''
            SELECT timestamp, COUNT(*) as count 
            FROM events 
            GROUP BY timestamp 
            ORDER BY id DESC 
            LIMIT ?
        ''', (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        return list(reversed(rows))
    
    @staticmethod
    def get_by_id(event_id):
        db = get_db()
        cursor = db.execute('SELECT * FROM events WHERE id = ?', (event_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def clear_all():
        db = get_db()
        db.execute('DELETE FROM events')
        db.commit()
