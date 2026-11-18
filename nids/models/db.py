import sqlite3
import os
from flask import g, current_app

def get_db():
    if 'db' not in g:
        db_path = current_app.config['DATABASE_PATH']
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        # Enable WAL mode for better concurrency
        g.db.execute('PRAGMA journal_mode=WAL;')
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db(app):
    db_path = app.config['DATABASE_PATH']
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Events (Packets) Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_ip TEXT,
            dest_ip TEXT,
            protocol TEXT,
            src_port INTEGER,
            dst_port INTEGER,
            length INTEGER,
            flags TEXT,
            info TEXT,
            pcap_source TEXT,
            raw_payload TEXT
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_src_ip ON events (source_ip);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_dst_ip ON events (dest_ip);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_proto ON events (protocol);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_pcap ON events (pcap_source);')

    # 2. Alerts Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            rule_name TEXT NOT NULL,
            severity TEXT NOT NULL,
            source_ip TEXT,
            dest_ip TEXT,
            protocol TEXT,
            port INTEGER,
            description TEXT,
            evidence TEXT,
            status TEXT DEFAULT 'Open',
            pcap_source TEXT
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_sev ON alerts (severity);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_src_ip ON alerts (source_ip);')

    # 3. Settings / Customizations Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')
    
    # Default settings
    default_settings = [
        ('background_theme', 'cyber-grid'),
        ('canvas_animation', 'true'),
        ('accent_color', '#00ffcc'),
        ('sound_alerts', 'true'),
        ('port_scan_threshold', '10'),
        ('syn_flood_threshold', '20'),
        ('icmp_flood_threshold', '15'),
        ('rule_port_scan_enabled', 'true'),
        ('rule_syn_flood_enabled', 'true'),
        ('rule_icmp_flood_enabled', 'true'),
        ('rule_suspicious_ports_enabled', 'true'),
        ('rule_dns_tunnel_enabled', 'true')
    ]
    cursor.executemany('''
        INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
    ''', default_settings)

    conn.commit()
    conn.close()
