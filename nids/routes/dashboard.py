import os
from flask import Blueprint, jsonify, send_from_directory
from nids.services.alert_service import AlertService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@dashboard_bp.route('/dashboard')
def index():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    dist_dir = os.path.join(base_dir, 'frontend', 'dist')
    return send_from_directory(dist_dir, 'index.html')

@dashboard_bp.route('/assets/<path:filename>')
def serve_react_assets(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    assets_dir = os.path.join(base_dir, 'frontend', 'dist', 'assets')
    return send_from_directory(assets_dir, filename)

@dashboard_bp.route('/api/stats')
def get_stats():
    summary = AlertService.get_dashboard_summary()
    return jsonify(summary)
