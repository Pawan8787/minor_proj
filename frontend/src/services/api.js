/**
 * API service for AI-Based Digital Road Register.
 * Communicates with the Flask backend, with graceful local fallback if offline.
 */

const API_BASE_URL = 'http://localhost:4000/api';

export const getRoads = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE_URL}/roads?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, using fallback roads data:', err);
  }
  return FALLBACK_ROADS;
};

export const getRoadById = async (roadId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/roads/${roadId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, using fallback road detail:', err);
  }
  const road = FALLBACK_ROADS.find((r) => r.id === roadId) || FALLBACK_ROADS[0];
  const defects = FALLBACK_DEFECTS.filter((d) => d.road_id === roadId || d.ward_no === road.ward_no);
  return { road, defects, condition_assessment: { condition_score: road.condition_score, condition_status: road.condition_status } };
};

export const createRoad = async (roadData, userRole = 'RMC_Officer') => {
  try {
    const res = await fetch(`${API_BASE_URL}/roads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(roadData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, using local road creation');
  }
  return { ...roadData, id: `ROAD-${roadData.road_type.replace(' ', '')}-${Math.floor(Math.random() * 900 + 100)}` };
};

export const getDefects = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE_URL}/defects?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, using fallback defects:', err);
  }
  return filterDefectsLocally(FALLBACK_DEFECTS, filters);
};

export const updateDefectStatus = async (defectId, status) => {
  try {
    const res = await fetch(`${API_BASE_URL}/defects/${defectId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, simulated defect status update');
  }
  return { id: defectId, status };
};

export const getDashboardSummary = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, using fallback summary');
  }
  return {
    total_roads: FALLBACK_ROADS.length,
    total_length_km: 37.1,
    total_defects: FALLBACK_DEFECTS.length,
    critical_defects_count: FALLBACK_DEFECTS.filter((d) => d.severity === 'Critical').length,
    drainage_issues_count: FALLBACK_DEFECTS.filter((d) => d.category === 'Drainage').length,
    missing_covers_count: FALLBACK_DEFECTS.filter((d) => d.condition === 'Missing').length,
    water_stagnation_count: FALLBACK_DEFECTS.filter((d) => d.asset_type.includes('Stagnation')).length,
    encroachment_count: FALLBACK_DEFECTS.filter((d) => d.asset_type.includes('Encroachment')).length,
    potholes_count: FALLBACK_DEFECTS.filter((d) => d.asset_type.includes('Pothole')).length,
    road_types: {
      'Type 1 (Arterial >80ft)': 2,
      'Type 2 (City Main 40-80ft)': 2,
      'Type 3 (Ward / Internal <40ft)': 2
    }
  };
};

export const getRules = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rules`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, using fallback rules');
  }
  return FALLBACK_RULES;
};

export const saveRules = async (rules, userRole = 'Admin') => {
  try {
    const res = await fetch(`${API_BASE_URL}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(rules)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, simulated save rules');
  }
  return { message: 'Rules saved locally' };
};

export const runOneClickAiAnalysis = async (params) => {
  try {
    const isFormData = params instanceof FormData;
    const options = {
      method: 'POST',
      body: isFormData ? params : JSON.stringify(params)
    };
    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }
    const res = await fetch(`${API_BASE_URL}/process_video_one_click`, options);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, simulated AI analysis');
  }
  // Local simulated fallback
  const width = params.get ? parseFloat(params.get('width_feet')) : params.width_feet || 120;
  return {
    status: 'success',
    road_type: width > 80 ? 'Type 1' : width >= 40 ? 'Type 2' : 'Type 3',
    classification: width > 80 ? 'Major Arterial Road' : width >= 40 ? 'City Main Road' : 'Ward / Internal Road',
    defects_detected_count: 4,
    detections: FALLBACK_DEFECTS.slice(0, 4)
  };
};

const filterDefectsLocally = (defects, filters) => {
  return defects.filter((d) => {
    if (filters.ward && String(d.ward_no) !== String(filters.ward)) return false;
    if (filters.road_type && d.road_type !== filters.road_type) return false;
    if (filters.category && d.category !== filters.category) return false;
    if (filters.condition && d.condition.toLowerCase() !== filters.condition.toLowerCase()) return false;
    if (filters.severity && d.severity.toLowerCase() !== filters.severity.toLowerCase()) return false;
    return true;
  });
};

export const FALLBACK_ROADS = [
  {
    id: "ROAD-T1-001",
    name: "Great Eastern (GE) Road Corridor",
    ward_no: 12,
    ward_name: "Swami Vivekananda Ward",
    road_type: "Type 1",
    classification: "Major Arterial Road",
    width_feet: 120,
    surface_type: "Bituminous / Asphalt",
    length_km: 14.5,
    zone: "Central Zone 3",
    condition_score: 72,
    condition_status: "Fair",
    officer: {
      name: "Er. Rajesh Verma",
      designation: "Executive Engineer (EE), PWD & RMC",
      phone: "+91 98261 44521",
      email: "rajesh.verma@rmcraipur.gov.in"
    }
  },
  {
    id: "ROAD-T1-002",
    name: "VIP Airport Expressway",
    ward_no: 18,
    ward_name: "Dr. Rajendra Prasad Ward",
    road_type: "Type 1",
    classification: "Major Arterial Road",
    width_feet: 100,
    surface_type: "Concrete Pavement",
    length_km: 9.2,
    zone: "South Zone 5",
    condition_score: 88,
    condition_status: "Good",
    officer: {
      name: "Er. Shalini Dewangan",
      designation: "Superintending Engineer (SE)",
      phone: "+91 94252 88310",
      email: "shalini.dewangan@rmcraipur.gov.in"
    }
  },
  {
    id: "ROAD-T2-001",
    name: "Telibandha - Marine Drive Boulevard",
    ward_no: 14,
    ward_name: "Pt. Ravishankar Shukla Ward",
    road_type: "Type 2",
    classification: "City Main Road",
    width_feet: 60,
    surface_type: "Bituminous / Asphalt",
    length_km: 5.4,
    zone: "Central Zone 3",
    condition_score: 64,
    condition_status: "Fair",
    officer: {
      name: "Er. Alok Sharma",
      designation: "Assistant Engineer (AE) - Drainage & Roads",
      phone: "+91 98930 11204",
      email: "alok.sharma@rmcraipur.gov.in"
    }
  },
  {
    id: "ROAD-T2-002",
    name: "Station Road to Pandri Market Link",
    ward_no: 7,
    ward_name: "Shaheed Bhagat Singh Ward",
    road_type: "Type 2",
    classification: "City Main Road",
    width_feet: 50,
    surface_type: "Concrete Pavement",
    length_km: 4.1,
    zone: "North Zone 2",
    condition_score: 42,
    condition_status: "Critical",
    officer: {
      name: "Er. Mahesh Chandrakar",
      designation: "Assistant Engineer (AE)",
      phone: "+91 97555 33219",
      email: "mahesh.c@rmcraipur.gov.in"
    }
  },
  {
    id: "ROAD-T3-001",
    name: "Shankar Nagar Sector 2 Internal Avenue",
    ward_no: 22,
    ward_name: "Kasturba Gandhi Ward",
    road_type: "Type 3",
    classification: "Ward / Internal Road",
    width_feet: 30,
    surface_type: "Bituminous / Asphalt",
    length_km: 2.3,
    zone: "East Zone 4",
    condition_score: 58,
    condition_status: "Fair",
    officer: {
      name: "Er. Priya Patel",
      designation: "Sub-Divisional Officer (SDO)",
      phone: "+91 94060 77123",
      email: "priya.patel@rmcraipur.gov.in"
    }
  },
  {
    id: "ROAD-T3-002",
    name: "Purani Basti Ward Lane 4",
    ward_no: 4,
    ward_name: "Mahamaya Mandir Ward",
    road_type: "Type 3",
    classification: "Ward / Internal Road",
    width_feet: 24,
    surface_type: "Paver Block / Concrete",
    length_km: 1.6,
    zone: "Old City Zone 1",
    condition_score: 38,
    condition_status: "Critical",
    officer: {
      name: "Er. Santosh Sahu",
      designation: "Junior Engineer (JE) - Maintenance",
      phone: "+91 91112 55430",
      email: "santosh.sahu@rmcraipur.gov.in"
    }
  }
];

export const FALLBACK_DEFECTS = [
  {
    id: "DEF-DRAIN-001",
    road_id: "ROAD-T1-001",
    road_name: "Great Eastern (GE) Road Corridor",
    ward_no: 12,
    road_type: "Type 1",
    category: "Drainage",
    asset_type: "Drain Cover Slab",
    condition: "Missing",
    severity: "Critical",
    latitude: 21.2530,
    longitude: 81.6210,
    chainage_km: "3.450 km",
    description: "Exposed open drain slab on northern carriageway verge. Severe safety hazard.",
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 14.2,
    reported_date: "2026-11-01",
    status: "Open",
    sla_hours: 24,
    assigned_officer: "Er. Rajesh Verma"
  },
  {
    id: "DEF-DRAIN-002",
    road_id: "ROAD-T1-001",
    road_name: "Great Eastern (GE) Road Corridor",
    ward_no: 12,
    road_type: "Type 1",
    category: "Drainage",
    asset_type: "Water Stagnation",
    condition: "Damaged",
    severity: "Critical",
    latitude: 21.2545,
    longitude: 81.6180,
    chainage_km: "4.120 km",
    description: "Water logging adjacent to carriageway causing structural sub-base softening.",
    image_url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 28.5,
    reported_date: "2026-11-02",
    status: "In Progress",
    sla_hours: 24,
    assigned_officer: "Er. Rajesh Verma"
  },
  {
    id: "DEF-DRAIN-003",
    road_id: "ROAD-T2-001",
    road_name: "Telibandha - Marine Drive Boulevard",
    ward_no: 14,
    road_type: "Type 2",
    category: "Drainage",
    asset_type: "Encroachment Over Drain",
    condition: "Damaged",
    severity: "High",
    latitude: 21.2380,
    longitude: 81.6580,
    chainage_km: "1.800 km",
    description: "Unauthorized commercial kiosk built directly over primary storm water drain box culvert.",
    image_url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 42.0,
    reported_date: "2026-11-03",
    status: "Open",
    sla_hours: 48,
    assigned_officer: "Er. Alok Sharma"
  },
  {
    id: "DEF-DRAIN-004",
    road_id: "ROAD-T2-002",
    road_name: "Station Road to Pandri Market Link",
    ward_no: 7,
    road_type: "Type 2",
    category: "Drainage",
    asset_type: "Manhole Cover",
    condition: "Damaged",
    severity: "Critical",
    latitude: 21.2610,
    longitude: 81.6385,
    chainage_km: "2.100 km",
    description: "Cast-iron manhole cover fractured and depressed by 80mm beneath road surface profile.",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 55.3,
    reported_date: "2026-11-01",
    status: "In Progress",
    sla_hours: 48,
    assigned_officer: "Er. Mahesh Chandrakar"
  },
  {
    id: "DEF-DRAIN-005",
    road_id: "ROAD-T3-002",
    road_name: "Purani Basti Ward Lane 4",
    ward_no: 4,
    road_type: "Type 3",
    category: "Drainage",
    asset_type: "Manhole Cover",
    condition: "Missing",
    severity: "Critical",
    latitude: 21.2335,
    longitude: 81.6265,
    chainage_km: "0.750 km",
    description: "Manhole cover completely missing in narrow internal street.",
    image_url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 6.8,
    reported_date: "2026-11-04",
    status: "Open",
    sla_hours: 24,
    assigned_officer: "Er. Santosh Sahu"
  },
  {
    id: "DEF-PAVE-001",
    road_id: "ROAD-T1-001",
    road_name: "Great Eastern (GE) Road Corridor",
    ward_no: 12,
    road_type: "Type 1",
    category: "Pavement",
    asset_type: "Pothole",
    condition: "Damaged",
    severity: "Critical",
    latitude: 21.2585,
    longitude: 81.6090,
    chainage_km: "5.800 km",
    description: "Deep pothole (diameter 1.2m, depth 95mm) in fast lane.",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 82.1,
    reported_date: "2026-11-02",
    status: "Open",
    sla_hours: 24,
    assigned_officer: "Er. Rajesh Verma"
  },
  {
    id: "DEF-SIGN-001",
    road_id: "ROAD-T1-002",
    road_name: "VIP Airport Expressway",
    ward_no: 18,
    road_type: "Type 1",
    category: "Signage & Safety",
    asset_type: "Signage",
    condition: "Damaged",
    severity: "Medium",
    latitude: 21.2050,
    longitude: 81.7100,
    chainage_km: "7.100 km",
    description: "Retro-reflective speed limit (60 km/h) sign bent, partially obstructed.",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 108.4,
    reported_date: "2026-11-04",
    status: "In Progress",
    sla_hours: 48,
    assigned_officer: "Er. Shalini Dewangan"
  },
  {
    id: "DEF-LGT-001",
    road_id: "ROAD-T2-002",
    road_name: "Station Road to Pandri Market Link",
    ward_no: 7,
    road_type: "Type 2",
    category: "Street Lighting",
    asset_type: "Lighting",
    condition: "Damaged",
    severity: "High",
    latitude: 21.2630,
    longitude: 81.6440,
    chainage_km: "3.200 km",
    description: "Twin LED street luminaire pole unlit; exposed wiring junction box at base.",
    image_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_timestamp_sec: 132.5,
    reported_date: "2026-11-03",
    status: "Open",
    sla_hours: 24,
    assigned_officer: "Er. Mahesh Chandrakar"
  }
];

export const FALLBACK_RULES = {
  "Type 1": {
    name: "Major Arterial Roads",
    min_width_feet: 80.0,
    traffic_density: "High Speed / Heavy Commercial Flow",
    sla_hours: {
      missing_manhole: 12,
      missing_drain_slab: 12,
      critical_pothole: 24,
      water_stagnation: 24,
      lighting_outage: 24,
      encroachment: 48
    },
    tolerances: {
      pothole_depth_max_mm: 25,
      water_stagnation_depth_max_cm: 2.0,
      lane_marking_fade_tolerance_pct: 20
    }
  },
  "Type 2": {
    name: "City Main Roads",
    min_width_feet: 40.0,
    max_width_feet: 80.0,
    traffic_density: "Medium / Mixed Urban Traffic",
    sla_hours: {
      missing_manhole: 24,
      missing_drain_slab: 24,
      critical_pothole: 48,
      water_stagnation: 36,
      lighting_outage: 48,
      encroachment: 72
    },
    tolerances: {
      pothole_depth_max_mm: 40,
      water_stagnation_depth_max_cm: 5.0,
      lane_marking_fade_tolerance_pct: 35
    }
  },
  "Type 3": {
    name: "Ward / Internal Roads",
    max_width_feet: 40.0,
    traffic_density: "Low / Neighborhood Residential",
    sla_hours: {
      missing_manhole: 24,
      missing_drain_slab: 36,
      critical_pothole: 72,
      water_stagnation: 48,
      lighting_outage: 72,
      encroachment: 96
    },
    tolerances: {
      pothole_depth_max_mm: 50,
      water_stagnation_depth_max_cm: 8.0,
      lane_marking_fade_tolerance_pct: 50
    }
  }
};

