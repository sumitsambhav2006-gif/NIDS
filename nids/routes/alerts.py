from flask import Blueprint, request, jsonify, Response
from nids.services.alert_service import AlertService

alerts_bp = Blueprint('alerts', __name__, url_prefix='/alerts')

@alerts_bp.route('/')
@alerts_bp.route('/api')
def api_list_alerts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)
    severity = request.args.get('severity', 'all')
    status = request.args.get('status', 'all')
    search = request.args.get('search', '').strip()
    pcap_source = request.args.get('pcap_source', '').strip() or None

    data = AlertService.get_alerts(
        page=page,
        per_page=per_page,
        severity=None if severity == 'all' else severity,
        status=None if status == 'all' else status,
        search=search if search else None,
        pcap_source=pcap_source
    )
    return jsonify(data)

@alerts_bp.route('/api/<int:alert_id>', methods=['GET'])
def get_alert_detail(alert_id):
    alert = AlertService.get_alert_by_id(alert_id)
    if not alert:
        return jsonify({'success': False, 'error': 'Alert not found'}), 404
    return jsonify({'success': True, 'alert': alert})

@alerts_bp.route('/api/<int:alert_id>/status', methods=['POST'])
def update_status(alert_id):
    req_data = request.get_json() or {}
    new_status = req_data.get('status', 'Investigating')
    AlertService.update_alert_status(alert_id, new_status)
    return jsonify({'success': True, 'alert_id': alert_id, 'new_status': new_status})

@alerts_bp.route('/api/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    AlertService.delete_alert(alert_id)
    return jsonify({'success': True, 'alert_id': alert_id})

@alerts_bp.route('/api/clear', methods=['POST'])
def clear_all():
    AlertService.clear_all()
    return jsonify({'success': True, 'message': 'All alerts and traffic events cleared.'})

@alerts_bp.route('/export/csv')
def export_csv():
    csv_data = AlertService.export_alerts_csv()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=nids_security_alerts.csv"}
    )

@alerts_bp.route('/export/json')
def export_json():
    json_data = AlertService.export_alerts_json()
    return Response(
        json_data,
        mimetype="application/json",
        headers={"Content-disposition": "attachment; filename=nids_security_alerts.json"}
    )
