"""
Digital Road Register & Infrastructure Asset/Defect Data Store.
Provides comprehensive models and seed data for:
- Road Register (Type 1 Arterial >80ft, Type 2 City Main 40-80ft, Type 3 Ward/Internal <40ft)
- Ward Classification & Officer Directory
- Drainage Assets (Drain cover slabs Good/Damaged/Missing, Water Stagnation, Encroachments, Manhole covers Good/Damaged/Missing)
- Complete Road Parameter Inventory (Pavement, Kerb, Footpath, Signage, Lighting, Cleanliness, etc.)
"""

import json
import os
import uuid
from datetime import datetime

# Sample Raipur / Smart City Ward & Road Master Register
INITIAL_ROADS = [
    {
        "id": "ROAD-T1-001",
        "name": "Great Eastern (GE) Road Corridor",
        "ward_no": 12,
        "ward_name": "Swami Vivekananda Ward",
        "road_type": "Type 1",
        "classification": "Major Arterial Road",
        "width_feet": 120,
        "surface_type": "Bituminous / Asphalt",
        "length_km": 14.5,
        "zone": "Central Zone 3",
        "start_point": "Jaistambh Chowk (21.2514, 81.6296)",
        "end_point": "Tatibandh Chowk (21.2642, 81.5583)",
        "condition_score": 72,
        "condition_status": "Fair",
        "officer": {
            "name": "Er. Rajesh Verma",
            "designation": "Executive Engineer (EE), PWD & RMC",
            "phone": "+91 98261 44521",
            "email": "rajesh.verma@rmcraipur.gov.in"
        }
    },
    {
        "id": "ROAD-T1-002",
        "name": "VIP Airport Expressway",
        "ward_no": 18,
        "ward_name": "Dr. Rajendra Prasad Ward",
        "road_type": "Type 1",
        "classification": "Major Arterial Road",
        "width_feet": 100,
        "surface_type": "Concrete Pavement",
        "length_km": 9.2,
        "zone": "South Zone 5",
        "start_point": "Telibandha Ring Road (21.2341, 81.6680)",
        "end_point": "Mana Airport Junction (21.1812, 81.7380)",
        "condition_score": 88,
        "condition_status": "Good",
        "officer": {
            "name": "Er. Shalini Dewangan",
            "designation": "Superintending Engineer (SE)",
            "phone": "+91 94252 88310",
            "email": "shalini.dewangan@rmcraipur.gov.in"
        }
    },
    {
        "id": "ROAD-T2-001",
        "name": "Telibandha - Marine Drive Boulevard",
        "ward_no": 14,
        "ward_name": "Pt. Ravishankar Shukla Ward",
        "road_type": "Type 2",
        "classification": "City Main Road",
        "width_feet": 60,
        "surface_type": "Bituminous / Asphalt",
        "length_km": 5.4,
        "zone": "Central Zone 3",
        "start_point": "Telibandha Talab (21.2365, 81.6621)",
        "end_point": "Ghadi Chowk (21.2435, 81.6420)",
        "condition_score": 64,
        "condition_status": "Fair",
        "officer": {
            "name": "Er. Alok Sharma",
            "designation": "Assistant Engineer (AE) - Drainage & Roads",
            "phone": "+91 98930 11204",
            "email": "alok.sharma@rmcraipur.gov.in"
        }
    },
    {
        "id": "ROAD-T2-002",
        "name": "Station Road to Pandri Market Link",
        "ward_no": 7,
        "ward_name": "Shaheed Bhagat Singh Ward",
        "road_type": "Type 2",
        "classification": "City Main Road",
        "width_feet": 50,
        "surface_type": "Concrete Pavement",
        "length_km": 4.1,
        "zone": "North Zone 2",
        "start_point": "Raipur Railway Station (21.2580, 81.6300)",
        "end_point": "Pandri Cloth Market (21.2650, 81.6490)",
        "condition_score": 42,
        "condition_status": "Critical",
        "officer": {
            "name": "Er. Mahesh Chandrakar",
            "designation": "Assistant Engineer (AE)",
            "phone": "+91 97555 33219",
            "email": "mahesh.c@rmcraipur.gov.in"
        }
    },
    {
        "id": "ROAD-T3-001",
        "name": "Shankar Nagar Sector 2 Internal Avenue",
        "ward_no": 22,
        "ward_name": "Kasturba Gandhi Ward",
        "road_type": "Type 3",
        "classification": "Ward / Internal Road",
        "width_feet": 30,
        "surface_type": "Bituminous / Asphalt",
        "length_km": 2.3,
        "zone": "East Zone 4",
        "start_point": "Shankar Nagar Main Gate (21.2480, 81.6700)",
        "end_point": "Sector 2 Community Hall (21.2495, 81.6755)",
        "condition_score": 58,
        "condition_status": "Fair",
        "officer": {
            "name": "Er. Priya Patel",
            "designation": "Sub-Divisional Officer (SDO)",
            "phone": "+91 94060 77123",
            "email": "priya.patel@rmcraipur.gov.in"
        }
    },
    {
        "id": "ROAD-T3-002",
        "name": "Purani Basti Ward Lane 4",
        "ward_no": 4,
        "ward_name": "Mahamaya Mandir Ward",
        "road_type": "Type 3",
        "classification": "Ward / Internal Road",
        "width_feet": 24,
        "surface_type": "Paver Block / Concrete",
        "length_km": 1.6,
        "zone": "Old City Zone 1",
        "start_point": "Mahamaya Temple Chowk (21.2310, 81.6240)",
        "end_point": "Budha Talab Ghat (21.2380, 81.6290)",
        "condition_score": 38,
        "condition_status": "Critical",
        "officer": {
            "name": "Er. Santosh Sahu",
            "designation": "Junior Engineer (JE) - Maintenance",
            "phone": "+91 91112 55430",
            "email": "santosh.sahu@rmcraipur.gov.in"
        }
    }
]

# Initial Seed Defect & Asset Inventory (Drainage, Pavement, Infrastructure)
INITIAL_DEFECTS = [
    # Drainage Asset Detections
    {
        "id": "DEF-DRAIN-001",
        "road_id": "ROAD-T1-001",
        "road_name": "Great Eastern (GE) Road Corridor",
        "ward_no": 12,
        "road_type": "Type 1",
        "category": "Drainage",
        "asset_type": "Drain Cover Slab",
        "condition": "Missing",
        "severity": "Critical",
        "latitude": 21.2530,
        "longitude": 81.6210,
        "chainage_km": "3.450 km",
        "description": "Exposed open drain slab on northern carriageway pedestrian verge. Severe hazard for pedestrians & two-wheelers.",
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 14.2,
        "reported_date": "2026-11-01",
        "status": "Open",
        "sla_hours": 24,
        "assigned_officer": "Er. Rajesh Verma"
    },
    {
        "id": "DEF-DRAIN-002",
        "road_id": "ROAD-T1-001",
        "road_name": "Great Eastern (GE) Road Corridor",
        "ward_no": 12,
        "road_type": "Type 1",
        "category": "Drainage",
        "asset_type": "Water Stagnation",
        "condition": "Damaged",
        "severity": "Critical",
        "latitude": 21.2545,
        "longitude": 81.6180,
        "chainage_km": "4.120 km",
        "description": "Extensive water logging (>15cm depth) adjacent to carriageway due to blocked curb drainage inlet.",
        "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 28.5,
        "reported_date": "2026-11-02",
        "status": "In Progress",
        "sla_hours": 24,
        "assigned_officer": "Er. Rajesh Verma"
    },
    {
        "id": "DEF-DRAIN-003",
        "road_id": "ROAD-T2-001",
        "road_name": "Telibandha - Marine Drive Boulevard",
        "ward_no": 14,
        "road_type": "Type 2",
        "category": "Drainage",
        "asset_type": "Encroachment Over Drain",
        "condition": "Damaged",
        "severity": "High",
        "latitude": 21.2380,
        "longitude": 81.6580,
        "chainage_km": "1.800 km",
        "description": "Unauthorized commercial kiosk built directly over primary storm water drain box culvert.",
        "image_url": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 42.0,
        "reported_date": "2026-11-03",
        "status": "Open",
        "sla_hours": 48,
        "assigned_officer": "Er. Alok Sharma"
    },
    {
        "id": "DEF-DRAIN-004",
        "road_id": "ROAD-T2-002",
        "road_name": "Station Road to Pandri Market Link",
        "ward_no": 7,
        "road_type": "Type 2",
        "category": "Drainage",
        "asset_type": "Manhole Cover",
        "condition": "Damaged",
        "severity": "Critical",
        "latitude": 21.2610,
        "longitude": 81.6385,
        "chainage_km": "2.100 km",
        "description": "Cast-iron manhole cover fractured and depressed by 80mm beneath road surface profile.",
        "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 55.3,
        "reported_date": "2026-11-01",
        "status": "In Progress",
        "sla_hours": 48,
        "assigned_officer": "Er. Mahesh Chandrakar"
    },
    {
        "id": "DEF-DRAIN-005",
        "road_id": "ROAD-T3-002",
        "road_name": "Purani Basti Ward Lane 4",
        "ward_no": 4,
        "road_type": "Type 3",
        "category": "Drainage",
        "asset_type": "Manhole Cover",
        "condition": "Missing",
        "severity": "Critical",
        "latitude": 21.2335,
        "longitude": 81.6265,
        "chainage_km": "0.750 km",
        "description": "Manhole cover completely missing in narrow internal street; temporary wooden log placed inside as warning.",
        "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 6.8,
        "reported_date": "2026-11-04",
        "status": "Open",
        "sla_hours": 24,
        "assigned_officer": "Er. Santosh Sahu"
    },
    {
        "id": "DEF-DRAIN-006",
        "road_id": "ROAD-T1-002",
        "road_name": "VIP Airport Expressway",
        "ward_no": 18,
        "road_type": "Type 1",
        "category": "Drainage",
        "asset_type": "Drain Cover Slab",
        "condition": "Good",
        "severity": "Low",
        "latitude": 21.2110,
        "longitude": 81.6980,
        "chainage_km": "5.600 km",
        "description": "Precast RCC drain cover slab intact, properly aligned with curb line and unblocked silt grating.",
        "image_url": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 70.0,
        "reported_date": "2026-11-03",
        "status": "Resolved",
        "sla_hours": 0,
        "assigned_officer": "Er. Shalini Dewangan"
    },

    # Pavement, Safety & Infrastructure Parameters (Annexure A)
    {
        "id": "DEF-PAVE-001",
        "road_id": "ROAD-T1-001",
        "road_name": "Great Eastern (GE) Road Corridor",
        "ward_no": 12,
        "road_type": "Type 1",
        "category": "Pavement",
        "asset_type": "Pothole",
        "condition": "Damaged",
        "severity": "Critical",
        "latitude": 21.2585,
        "longitude": 81.6090,
        "chainage_km": "5.800 km",
        "description": "Deep pothole (diameter 1.2m, depth 95mm) in fast lane causing sudden vehicular swerving.",
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 82.1,
        "reported_date": "2026-11-02",
        "status": "Open",
        "sla_hours": 24,
        "assigned_officer": "Er. Rajesh Verma"
    },
    {
        "id": "DEF-KERB-001",
        "road_id": "ROAD-T2-001",
        "road_name": "Telibandha - Marine Drive Boulevard",
        "ward_no": 14,
        "road_type": "Type 2",
        "category": "Kerb & Footpath",
        "asset_type": "Kerb / Footpath Damage",
        "condition": "Damaged",
        "severity": "Medium",
        "latitude": 21.2392,
        "longitude": 81.6540,
        "chainage_km": "2.400 km",
        "description": "Displaced concrete kerb stone edging and damaged tactile paving on pedestrian pathway.",
        "image_url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 95.0,
        "reported_date": "2026-11-03",
        "status": "Open",
        "sla_hours": 72,
        "assigned_officer": "Er. Alok Sharma"
    },
    {
        "id": "DEF-SIGN-001",
        "road_id": "ROAD-T1-002",
        "road_name": "VIP Airport Expressway",
        "ward_no": 18,
        "road_type": "Type 1",
        "category": "Signage & Safety",
        "asset_type": "Signage",
        "condition": "Damaged",
        "severity": "Medium",
        "latitude": 21.2050,
        "longitude": 81.7100,
        "chainage_km": "7.100 km",
        "description": "Retro-reflective speed limit (60 km/h) gantry sign bent due to storm wind, partially obstructed.",
        "image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 108.4,
        "reported_date": "2026-11-04",
        "status": "In Progress",
        "sla_hours": 48,
        "assigned_officer": "Er. Shalini Dewangan"
    },
    {
        "id": "DEF-MARK-001",
        "road_id": "ROAD-T1-001",
        "road_name": "Great Eastern (GE) Road Corridor",
        "ward_no": 12,
        "road_type": "Type 1",
        "category": "Road Markings",
        "asset_type": "Markings & Lane Lines",
        "condition": "Damaged",
        "severity": "Medium",
        "latitude": 21.2505,
        "longitude": 81.6270,
        "chainage_km": "1.200 km",
        "description": "Thermoplastic pedestrian zebra crossing and lane divider markings completely faded (>70% loss).",
        "image_url": "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 118.0,
        "reported_date": "2026-11-02",
        "status": "Open",
        "sla_hours": 72,
        "assigned_officer": "Er. Rajesh Verma"
    },
    {
        "id": "DEF-LGT-001",
        "road_id": "ROAD-T2-002",
        "road_name": "Station Road to Pandri Market Link",
        "ward_no": 7,
        "road_type": "Type 2",
        "category": "Street Lighting",
        "asset_type": "Lighting",
        "condition": "Damaged",
        "severity": "High",
        "latitude": 21.2630,
        "longitude": 81.6440,
        "chainage_km": "3.200 km",
        "description": "Twin LED street luminaire pole unlit; exposed wiring junction box at base presenting electrocution hazard.",
        "image_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 132.5,
        "reported_date": "2026-11-03",
        "status": "Open",
        "sla_hours": 24,
        "assigned_officer": "Er. Mahesh Chandrakar"
    },
    {
        "id": "DEF-CLN-001",
        "road_id": "ROAD-T3-001",
        "road_name": "Shankar Nagar Sector 2 Internal Avenue",
        "ward_no": 22,
        "road_type": "Type 3",
        "category": "Cleanliness & Debris",
        "asset_type": "Cleanliness / Unauthorized Activity",
        "condition": "Damaged",
        "severity": "Medium",
        "latitude": 21.2488,
        "longitude": 81.6725,
        "chainage_km": "0.900 km",
        "description": "Construction debris dumping encroaching on roadway edge and blocking roadside drainage flow.",
        "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "video_timestamp_sec": 145.0,
        "reported_date": "2026-11-04",
        "status": "Open",
        "sla_hours": 48,
        "assigned_officer": "Er. Priya Patel"
    }
]

DATA_FILE = os.path.join(os.path.dirname(__file__), "digital_road_register_db.json")

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading data file:", e)
    
    # Save initial seed data
    data = {
        "roads": INITIAL_ROADS,
        "defects": INITIAL_DEFECTS
    }
    save_data(data)
    return data

def save_data(data):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Error saving data file:", e)

def get_all_roads():
    data = load_data()
    return data.get("roads", [])

def get_road_by_id(road_id):
    roads = get_all_roads()
    for r in roads:
        if r["id"] == road_id:
            return r
    return None

def add_road(road_data):
    data = load_data()
    if not road_data.get("id"):
        # Auto-generate ID according to road type
        rtype = road_data.get("road_type", "Type 3").replace(" ", "")
        road_data["id"] = f"ROAD-{rtype}-{len(data['roads']) + 1:03d}"
    
    # Classify based on width if not set
    width = float(road_data.get("width_feet", 30))
    if width > 80:
        road_data["road_type"] = "Type 1"
        road_data["classification"] = "Major Arterial Road"
    elif 40 <= width <= 80:
        road_data["road_type"] = "Type 2"
        road_data["classification"] = "City Main Road"
    else:
        road_data["road_type"] = "Type 3"
        road_data["classification"] = "Ward / Internal Road"
        
    data["roads"].append(road_data)
    save_data(data)
    return road_data

def get_all_defects(filters=None):
    data = load_data()
    defects = data.get("defects", [])
    if not filters:
        return defects
    
    filtered = []
    for d in defects:
        match = True
        if filters.get("ward") and str(d.get("ward_no")) != str(filters["ward"]):
            match = False
        if filters.get("road_type") and d.get("road_type") != filters["road_type"]:
            match = False
        if filters.get("category") and d.get("category") != filters["category"]:
            match = False
        if filters.get("asset_type") and d.get("asset_type") != filters["asset_type"]:
            match = False
        if filters.get("condition") and d.get("condition").lower() != filters["condition"].lower():
            match = False
        if filters.get("severity") and d.get("severity").lower() != filters["severity"].lower():
            match = False
        if filters.get("status") and d.get("status").lower() != filters["status"].lower():
            match = False
        if match:
            filtered.append(d)
    return filtered

def add_defect(defect_data):
    data = load_data()
    if not defect_data.get("id"):
        cat_prefix = defect_data.get("category", "DEF")[:5].upper()
        defect_data["id"] = f"DEF-{cat_prefix}-{len(data['defects']) + 1:03d}"
    if not defect_data.get("reported_date"):
        defect_data["reported_date"] = datetime.now().strftime("%Y-%m-%d")
    if not defect_data.get("status"):
        defect_data["status"] = "Open"
        
    data["defects"].append(defect_data)
    save_data(data)
    return defect_data

def update_defect_status(defect_id, new_status):
    data = load_data()
    for d in data.get("defects", []):
        if d["id"] == defect_id:
            d["status"] = new_status
            save_data(data)
            return d
    return None

