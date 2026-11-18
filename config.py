import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'nids-soc-cyber-shield-key-secret-2026')
    TEMPLATES_AUTO_RELOAD = True
    SEND_FILE_MAX_AGE_DEFAULT = 0
    DATABASE_PATH = os.path.join(BASE_DIR, 'instance', 'nids.db')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    REPORTS_FOLDER = os.path.join(BASE_DIR, 'reports')
    SAMPLE_PCAPS_FOLDER = os.path.join(BASE_DIR, 'sample_pcaps')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB max upload
    ALLOWED_EXTENSIONS = {'pcap', 'pcapng', 'cap'}
    
    # NIDS Detection Thresholds (Configurable)
    PORT_SCAN_THRESHOLD = int(os.environ.get('PORT_SCAN_THRESHOLD', 10))
    SYN_FLOOD_THRESHOLD = int(os.environ.get('SYN_FLOOD_THRESHOLD', 20))
    ICMP_FLOOD_THRESHOLD = int(os.environ.get('ICMP_FLOOD_THRESHOLD', 15))
    SUSPICIOUS_PORTS = {
        21: 'FTP (Cleartext Credentials)',
        23: 'Telnet (Unencrypted Admin)',
        4444: 'Metasploit Default Shell Port',
        5555: 'Android ADB Remote Bridge',
        6667: 'IRC Botnet C2 Channel',
        31337: 'BackOrifice / Elite Trojan'
    }

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
