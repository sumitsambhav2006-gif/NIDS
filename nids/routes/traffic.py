from flask import Blueprint, request, jsonify
from nids.models.event import EventModel

traffic_bp = Blueprint('traffic', __name__, url_prefix='/traffic')

@traffic_bp.route('/api')
def get_traffic_api():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    protocol = request.args.get('protocol', 'ALL')
    search = request.args.get('search', '').strip()

    events = EventModel.get_all(
        limit=per_page,
        offset=(page - 1) * per_page,
        protocol=protocol,
        search=search if search else None
    )
    total = EventModel.count(protocol=protocol, search=search if search else None)
    total_pages = max(1, (total + per_page - 1) // per_page)

    return jsonify({
        'events': events,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages
    })

@traffic_bp.route('/api/<int:event_id>')
def get_single_event(event_id):
    event = EventModel.get_by_id(event_id)
    if not event:
        return jsonify({'success': False, 'error': 'Event not found'}), 404
    return jsonify({'success': True, 'event': event})
