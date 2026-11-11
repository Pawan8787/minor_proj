"""
Road-Type-Based Contextual Rules Engine.
Provides configurable rules and thresholds for infrastructure parameter assessment
contextual to road classification:
- Type 1: Major Arterial Roads (Width > 80 feet)
- Type 2: City Main Roads (Width between 40 to 80 feet)
- Type 3: Ward / Internal Roads (Width less than 40 feet)
"""

import json
import os

DEFAULT_RULES = {
    "Type 1": {
        "name": "Major Arterial Roads",
        "min_width_feet": 80.0,
        "traffic_density": "High Speed / Heavy Commercial Flow",
        "sla_hours": {
            "missing_manhole": 12,
            "missing_drain_slab": 12,
            "critical_pothole": 24,
            "water_stagnation": 24,
            "crash_barrier_damaged": 24,
            "lighting_outage": 24,
            "encroachment": 48
        },
        "tolerances": {
            "pothole_depth_max_mm": 25,
            "pothole_area_max_sqm": 0.1,
            "water_stagnation_depth_max_cm": 2.0,
            "lane_marking_fade_tolerance_pct": 20,
            "kerb_displacement_max_mm": 30
        },
        "weights": {
            "drainage": 0.30,
            "pavement": 0.30,
            "safety_signage": 0.20,
            "lighting": 0.10,
            "cleanliness": 0.10
        }
    },
    "Type 2": {
        "name": "City Main Roads",
        "min_width_feet": 40.0,
        "max_width_feet": 80.0,
        "traffic_density": "Medium / Mixed Urban Traffic",
        "sla_hours": {
            "missing_manhole": 24,
            "missing_drain_slab": 24,
            "critical_pothole": 48,
            "water_stagnation": 36,
            "crash_barrier_damaged": 48,
            "lighting_outage": 48,
            "encroachment": 72
        },
        "tolerances": {
            "pothole_depth_max_mm": 40,
            "pothole_area_max_sqm": 0.25,
            "water_stagnation_depth_max_cm": 5.0,
            "lane_marking_fade_tolerance_pct": 35,
            "kerb_displacement_max_mm": 50
        },
        "weights": {
            "drainage": 0.25,
            "pavement": 0.25,
            "safety_signage": 0.20,
            "lighting": 0.15,
            "cleanliness": 0.15
        }
    },
    "Type 3": {
        "name": "Ward / Internal Roads",
        "max_width_feet": 40.0,
        "traffic_density": "Low / Neighborhood Residential",
        "sla_hours": {
            "missing_manhole": 24,
            "missing_drain_slab": 36,
            "critical_pothole": 72,
            "water_stagnation": 48,
            "crash_barrier_damaged": 72,
            "lighting_outage": 72,
            "encroachment": 96
        },
        "tolerances": {
            "pothole_depth_max_mm": 50,
            "pothole_area_max_sqm": 0.40,
            "water_stagnation_depth_max_cm": 8.0,
            "lane_marking_fade_tolerance_pct": 50,
            "kerb_displacement_max_mm": 80
        },
        "weights": {
            "drainage": 0.35, # Internal drains frequently flood houses
            "pavement": 0.25,
            "cleanliness": 0.20,
            "lighting": 0.15,
            "safety_signage": 0.05
        }
    }
}

RULES_FILE = os.path.join(os.path.dirname(__file__), "contextual_rules_config.json")

def load_rules():
    if os.path.exists(RULES_FILE):
        try:
            with open(RULES_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print("Error reading rules file:", e)
    
    # Save default rules
    save_rules(DEFAULT_RULES)
    return DEFAULT_RULES

def save_rules(rules):
    try:
        with open(RULES_FILE, "w") as f:
            json.dump(rules, f, indent=2)
    except Exception as e:
        print("Error saving rules file:", e)

def classify_road_by_width(width_feet):
    try:
        w = float(width_feet)
    except (ValueError, TypeError):
        w = 30.0

    if w > 80.0:
        return "Type 1", "Major Arterial Road"
    elif 40.0 <= w <= 80.0:
        return "Type 2", "City Main Road"
    else:
        return "Type 3", "Ward / Internal Road"

def evaluate_defect_severity(asset_type, condition, road_type, measurements=None):
    """
    Contextual rules engine: computes defect severity and SLA hours based on road classification.
    """
    rules = load_rules().get(road_type, DEFAULT_RULES.get(road_type, DEFAULT_RULES["Type 2"]))
    slas = rules.get("sla_hours", {})
    
    # Condition evaluation
    cond = (condition or "").lower()
    asset = (asset_type or "").lower()
    
    severity = "Medium"
    sla = 48
    
    if "manhole" in asset:
        if "missing" in cond:
            severity = "Critical"
            sla = slas.get("missing_manhole", 24)
        elif "damaged" in cond:
            severity = "Critical" if road_type == "Type 1" else "High"
            sla = slas.get("missing_manhole", 24) * 2
        else:
            severity = "Low"
            sla = 0
            
    elif "drain cover" in asset or "drain" in asset and "slab" in asset:
        if "missing" in cond:
            severity = "Critical"
            sla = slas.get("missing_drain_slab", 24)
        elif "damaged" in cond:
            severity = "High" if road_type in ["Type 1", "Type 2"] else "Medium"
            sla = slas.get("missing_drain_slab", 24) * 2
        else:
            severity = "Low"
            sla = 0
            
    elif "stagnation" in asset or "water" in asset:
        severity = "Critical" if road_type == "Type 1" else "High"
        sla = slas.get("water_stagnation", 36)
        
    elif "encroachment" in asset:
        severity = "High" if road_type in ["Type 1", "Type 2"] else "Medium"
        sla = slas.get("encroachment", 72)
        
    elif "pothole" in asset:
        if road_type == "Type 1":
            severity = "Critical"
            sla = slas.get("critical_pothole", 24)
        elif road_type == "Type 2":
            severity = "High"
            sla = slas.get("critical_pothole", 48)
        else:
            severity = "Medium"
            sla = slas.get("critical_pothole", 72)
            
    elif "light" in asset:
        severity = "High" if road_type == "Type 1" else "Medium"
        sla = slas.get("lighting_outage", 48)
        
    return {
        "severity": severity,
        "sla_hours": sla,
        "road_type": road_type,
        "applied_rules": rules["name"]
    }

def calculate_road_condition_index(road_type, defects_list):
    """
    Computes Road Condition Index (0 - 100) and color code based on contextual rules.
    """
    score = 100.0
    rules = load_rules().get(road_type, DEFAULT_RULES["Type 2"])
    
    for d in defects_list:
        sev = d.get("severity", "Medium")
        if sev == "Critical":
            deduction = 18 if road_type == "Type 1" else 14
        elif sev == "High":
            deduction = 10 if road_type == "Type 1" else 8
        elif sev == "Medium":
            deduction = 5
        else:
            deduction = 1
        score -= deduction
        
    score = max(10, min(100, int(score)))
    
    if score >= 80:
        status = "Good"
        color = "#22c55e" # Green
    elif score >= 50:
        status = "Fair"
        color = "#eab308" # Yellow / Amber
    else:
        status = "Critical"
        color = "#ef4444" # Red
        
    return {
        "condition_score": score,
        "condition_status": status,
        "status_color": color
    }

