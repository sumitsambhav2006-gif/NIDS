import os
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from config import config_by_name
from nids.models.db import init_db, close_db
from nids.routes.dashboard import dashboard_bp
from nids.routes.alerts import alerts_bp
from nids.routes.capture import capture_bp
from nids.routes.traffic import traffic_bp
from nids.routes.settings import settings_bp

def create_app(config_name='development'):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_by_name.get(config_name, 'development'))

    # Enable CORS for React frontend (Vite port 5173 / localhost)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure required directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
    os.makedirs(app.config['SAMPLE_PCAPS_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['DATABASE_PATH']), exist_ok=True)

    # Initialize SQLite Database & register teardown
    init_db(app)
    app.teardown_appcontext(close_db)

    # Register Blueprints
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(capture_bp)
    app.register_blueprint(traffic_bp)
    app.register_blueprint(settings_bp)

    # Global API aliases for frontend convenience
    from nids.routes.alerts import api_list_alerts, clear_all as clear_alerts_api
    from nids.routes.traffic import get_traffic_api
    from nids.routes.settings import get_settings, save_settings

    @app.route('/api/alerts', methods=['GET'])
    def global_api_alerts():
        return api_list_alerts()

    @app.route('/api/alerts/clear', methods=['POST'])
    def global_api_clear():
        return clear_alerts_api()

    @app.route('/api/traffic', methods=['GET'])
    def global_api_traffic():
        return get_traffic_api()

    @app.route('/api/settings', methods=['GET', 'POST'])
    def global_api_settings():
        if request.method == 'POST':
            return save_settings()
        return get_settings()

    # Serve React SPA build if available, else fallback to Jinja dashboard
    base_dir = os.path.dirname(os.path.dirname(__file__))
    dist_dir = os.path.join(base_dir, 'frontend', 'dist')

    @app.route('/app', defaults={'path': ''})
    @app.route('/app/<path:path>')
    def serve_spa(path):
        if os.path.exists(dist_dir):
            if path and os.path.exists(os.path.join(dist_dir, path)):
                return send_from_directory(dist_dir, path)
            index_path = os.path.join(dist_dir, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(dist_dir, 'index.html')
        return {'error': 'Frontend build not found. Run npm run build.'}, 404

    return app
