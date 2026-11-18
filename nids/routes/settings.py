from flask import Blueprint, request, jsonify
from nids.services.analysis_service import AnalysisService

settings_bp = Blueprint('settings', __name__, url_prefix='/settings')

@settings_bp.route('/api', methods=['GET'])
def get_settings():
    current_settings = AnalysisService.get_settings()
    return jsonify(current_settings)

@settings_bp.route('/api', methods=['POST'])
def save_settings():
    req_data = request.get_json() or {}
    if not req_data:
        return jsonify({'success': False, 'error': 'No settings payload provided'}), 400

    try:
        AnalysisService.update_settings(req_data)
        return jsonify({'success': True, 'message': 'Customization and system settings saved successfully!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
