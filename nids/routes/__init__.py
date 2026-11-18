from nids.routes.dashboard import dashboard_bp
from nids.routes.alerts import alerts_bp
from nids.routes.capture import capture_bp
from nids.routes.traffic import traffic_bp
from nids.routes.settings import settings_bp

__all__ = ['dashboard_bp', 'alerts_bp', 'capture_bp', 'traffic_bp', 'settings_bp']
