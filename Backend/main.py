import os
import time
import json
from threading import Thread
from flask import Flask, request, Response, jsonify

# Import core modules
from models_data import (
    get_all_roads,
    get_road_by_id,
    add_road,
    get_all_defects,
    add_defect,
    update_defect_status
)
from rules_engine import (
    load_rules,
    save_rules,
    classify_road_by_width,
    evaluate_defect_severity,
    calculate_road_condition_index
)
from asset_defect_processor import AutomatedAIProcessor
from reports_generator import generate_csv_report, generate_html_printable_report
from auth_rbac import authenticate_user, check_permission

# Optional legacy modules
try:
    from stream import streaming
    stream = streaming()
except Exception as e:
    print("Warning: streaming module not loaded:", e)
    stream = None

try:
    from upload_images import upload_images
except Exception as e:
    upload_images = None

try:
    from Processor_backend import processer
except Exception as e:
    processer = None

try:
    import firebase_admin
    from firebase_admin import credentials, storage, firestore
    cred_location = os.path.join(os.path.dirname(__file__), "serviceAccount.json")
    if os.path.exists(cred_location) and not firebase_admin._apps:
        cred = credentials.Certificate(cred_location)
        firebase_admin.initialize_app(cred, {'storageBucket': 'accio-2f266.appspot.com'})
        db = firestore.client()
        bucket = storage.bucket()
    else:
        db = None
        bucket = None
except Exception as e:
    print("Firebase init notice:", e)
    db = None
    bucket = None

streamer = Flask(__name__)
ai_processor = AutomatedAIProcessor()

# Enable CORS for frontend requests
@streamer.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Role')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle OPTIONS preflight for all endpoints
@streamer.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@streamer.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return Response(status=200)

# ==========================================
# 1. DIGITAL ROAD REGISTER API
# ==========================================
@streamer.route('/api/roads', methods=['GET', 'POST'])
def handle_roads():
    if request.method == 'POST':
        user_role = request.headers.get('X-User-Role', 'Viewer')
        if not check_permission(user_role, 'manage_register'):
            return jsonify({'error': 'Unauthorized: Only RMC Officers and Admins can create roads.'}), 403
            
        data = request.json or {}
        new_road = add_road(data)
        return jsonify(new_road), 201

    # GET with filtering
    roads = get_all_roads()
    ward = request.args.get('ward')
    road_type = request.args.get('road_type')
    
    if ward:
        roads = [r for r in roads if str(r.get('ward_no')) == str(ward)]
    if road_type:
        roads = [r for r in roads if r.get('road_type') == road_type]
        
    return jsonify(roads)

@streamer.route('/api/roads/<road_id>', methods=['GET'])
def get_single_road(road_id):
    road = get_road_by_id(road_id)
    if not road:
        return jsonify({'error': 'Road not found'}), 404
    # Include defects for this road
    defects = get_all_defects({'ward': road.get('ward_no'), 'road_type': road.get('road_type')})
    condition_assessment = calculate_road_condition_index(road.get('road_type', 'Type 2'), defects)
    return jsonify({
        'road': road,
        'defects': defects,
        'condition_assessment': condition_assessment
    })

# ==========================================
# 2. DEFECTS & ASSETS INVENTORY API
# ==========================================
@streamer.route('/api/defects', methods=['GET', 'POST'])
def handle_defects():
    if request.method == 'POST':
        data = request.json or {}
        # Apply contextual rules engine
        road_type = data.get('road_type', 'Type 2')
        eval_res = evaluate_defect_severity(data.get('asset_type'), data.get('condition'), road_type)
        data['severity'] = eval_res['severity']
        data['sla_hours'] = eval_res['sla_hours']
        
        defect = add_defect(data)
        return jsonify(defect), 201

    # Filters
    filters = {
        'ward': request.args.get('ward'),
        'road_type': request.args.get('road_type'),
        'category': request.args.get('category'),
        'asset_type': request.args.get('asset_type'),
        'condition': request.args.get('condition'),
        'severity': request.args.get('severity'),
        'status': request.args.get('status')
    }
    # Clean None
    filters = {k: v for k, v in filters.items() if v}
    defects = get_all_defects(filters)
    return jsonify(defects)

@streamer.route('/api/defects/<defect_id>/status', methods=['PUT', 'POST'])
def update_status(defect_id):
    status = request.json.get('status', 'Open')
    updated = update_defect_status(defect_id, status)
    if not updated:
        return jsonify({'error': 'Defect not found'}), 404
    return jsonify(updated)

# ==========================================
# 3. INTERACTIVE DASHBOARD SUMMARY METRICS
# ==========================================
@streamer.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    roads = get_all_roads()
    defects = get_all_defects()
    
    total_km = sum(r.get('length_km', 0) for r in roads)
    critical_defects = [d for d in defects if d.get('severity') == 'Critical']
    drainage_defects = [d for d in defects if d.get('category') == 'Drainage']
    missing_assets = [d for d in defects if d.get('condition') == 'Missing']
    water_stagnation = [d for d in defects if 'stagnation' in d.get('asset_type', '').lower()]
    encroachments = [d for d in defects if 'encroachment' in d.get('asset_type', '').lower()]
    potholes = [d for d in defects if 'pothole' in d.get('asset_type', '').lower()]
    
    # Road type distribution
    type1_count = len([r for r in roads if r.get('road_type') == 'Type 1'])
    type2_count = len([r for r in roads if r.get('road_type') == 'Type 2'])
    type3_count = len([r for r in roads if r.get('road_type') == 'Type 3'])
    
    return jsonify({
        'total_roads': len(roads),
        'total_length_km': round(total_km, 2),
        'total_defects': len(defects),
        'critical_defects_count': len(critical_defects),
        'drainage_issues_count': len(drainage_defects),
        'missing_covers_count': len(missing_assets),
        'water_stagnation_count': len(water_stagnation),
        'encroachment_count': len(encroachments),
        'potholes_count': len(potholes),
        'road_types': {
            'Type 1 (Arterial >80ft)': type1_count,
            'Type 2 (City Main 40-80ft)': type2_count,
            'Type 3 (Ward / Internal <40ft)': type3_count
        }
    })

# ==========================================
# 4. ROAD-TYPE CONTEXTUAL RULES ENGINE API
# ==========================================
@streamer.route('/api/rules', methods=['GET', 'POST'])
def handle_rules():
    if request.method == 'POST':
        user_role = request.headers.get('X-User-Role', 'Viewer')
        if not check_permission(user_role, 'all'):
            return jsonify({'error': 'Unauthorized: Only Admins can modify the rules engine.'}), 403
            
        new_rules = request.json or {}
        save_rules(new_rules)
        return jsonify({'message': 'Contextual rules updated successfully.', 'rules': new_rules})
        
    return jsonify(load_rules())

# ==========================================
# 5. ONE-CLICK AUTOMATED AI SURVEY PROCESSING
# ==========================================
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}

def _handle_media_analysis(file_obj, form_or_json):
    uploaded_path = None
    is_image = False
    
    if file_obj and file_obj.filename != '':
        ext = os.path.splitext(file_obj.filename)[1].lower()
        is_image = ext in IMAGE_EXTENSIONS or file_obj.mimetype.startswith('image/')
        saved_filename = f"upload_{int(time.time())}_{file_obj.filename}"
        uploaded_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        file_obj.save(uploaded_path)
    
    road_id = form_or_json.get('road_id', 'ROAD-T1-001')
    try:
        width_feet = float(form_or_json.get('width_feet', 120))
    except (ValueError, TypeError):
        width_feet = 120.0
    try:
        lat = float(form_or_json.get('lat', 21.2514))
    except (ValueError, TypeError):
        lat = 21.2514
    try:
        lng = float(form_or_json.get('lng', 81.6296))
    except (ValueError, TypeError):
        lng = 81.6296

    if is_image and uploaded_path:
        result = ai_processor.process_image_file(
            image_path=uploaded_path,
            road_id=road_id,
            road_width_feet=width_feet,
            base_lat=lat,
            base_lng=lng
        )
    else:
        result = ai_processor.process_video_file(
            video_path=uploaded_path,
            road_id=road_id,
            road_width_feet=width_feet,
            base_lat=lat,
            base_lng=lng
        )
    return jsonify(result)

@streamer.route('/api/process_video_one_click', methods=['POST'])
def process_video_one_click():
    # Supports video, image, or file field
    file = None
    for field in ['video', 'image', 'file']:
        if field in request.files and request.files[field].filename != '':
            file = request.files[field]
            break
            
    payload = request.form if file else (request.json or {})
    return _handle_media_analysis(file, payload)

@streamer.route('/api/process_image', methods=['POST'])
def process_image():
    file = None
    for field in ['image', 'video', 'file']:
        if field in request.files and request.files[field].filename != '':
            file = request.files[field]
            break
            
    payload = request.form if file else (request.json or {})
    return _handle_media_analysis(file, payload)

@streamer.route('/detections/<filename>')
def serve_detection_image(filename):
    static_dir = os.path.join(os.path.dirname(__file__), "static", "detections")
    from flask import send_from_directory
    return send_from_directory(static_dir, filename)

# ==========================================
# 6. DOWNLOADABLE REPORTS (PDF/EXCEL/CSV) API
# ==========================================
@streamer.route('/api/reports/export', methods=['GET'])
def export_reports():
    format_type = request.args.get('format', 'csv').lower()
    ward = request.args.get('ward')
    road_type = request.args.get('road_type')
    
    if format_type == 'csv':
        csv_content = generate_csv_report(ward_filter=ward, road_type_filter=road_type)
        return Response(
            csv_content,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=digital_road_register_ward_{ward or "all"}.csv'}
        )
    else:
        # Printable HTML (Print to PDF)
        html_content = generate_html_printable_report(ward_filter=ward, road_type_filter=road_type)
        return Response(html_content, mimetype='text/html')

# ==========================================
# 7. ROLE-BASED ACCESS CONTROL API
# ==========================================
@streamer.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    email = data.get('email', 'officer@rmc.gov.in')
    user = authenticate_user(email)
    return jsonify({
        'status': 'success',
        'user': user,
        'token': f"token-{user['role']}-{os.urandom(4).hex()}"
    })

# ==========================================
# 8. LEGACY COMPATIBILITY ENDPOINTS
# ==========================================
@streamer.route('/uploadvideo', methods=['POST', 'GET'])
def start_stream():
    if request.method == 'POST':
        video_data = request.files.get('video')
        video_url = request.form.get('video_url')
        if video_data:
            video_data = request.files['video'].read()
        longi = request.form.get('logi', '81.6296')
        lati = request.form.get('lati', '21.2514')
        if stream:
            stream.set_data(longi, lati, video_data=video_data, video_url=video_url)
    if stream and stream.cap is not None and stream.cap.isOpened():
        return Response(stream.generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    else:
        # Graceful fallback response
        return jsonify({'status': 'stream_received', 'message': 'Video processed into digital register.'}), 200

@streamer.route('/stop_stream')
def stop_stream():
    if stream and stream.cap:
        try:
            os.remove(stream.path_video)
        except Exception:
            pass
        stream.cap.release()
        stream.cap = None
    return Response("Stream Ended", status=200)

def run_app():
    port = int(os.environ.get('PORT', 4000))
    print(f"Digital Road Register API running on port {port}")
    streamer.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    run_app()
