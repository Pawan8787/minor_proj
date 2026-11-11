"""
Reports Generator for AI-Based Digital Road Register.
Generates:
1. Ward-wise and Road-type filtered CSV/Excel spreadsheets
2. Printable HTML / PDF Executive Inspection Reports with Municipal Header,
   Officer Contacts, Condition Score, and Drainage Defect Logs.
"""

import io
import csv
from datetime import datetime
from models_data import get_all_roads, get_all_defects

def generate_csv_report(ward_filter=None, road_type_filter=None):
    """
    Generates CSV text buffer compatible with Microsoft Excel and LibreOffice.
    """
    filters = {}
    if ward_filter:
        filters["ward"] = ward_filter
    if road_type_filter:
        filters["road_type"] = road_type_filter
        
    defects = get_all_defects(filters)
    roads = get_all_roads()
    roads_map = {r["id"]: r for r in roads}
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow([
        "Defect ID",
        "Road ID",
        "Road Name",
        "Ward No",
        "Road Type",
        "Road Width (ft)",
        "Asset Category",
        "Asset Type",
        "Condition",
        "Severity",
        "Latitude",
        "Longitude",
        "Chainage",
        "SLA (Hours)",
        "Assigned Officer",
        "Status",
        "Reported Date",
        "Geo-Tagged Photo URL",
        "Survey Video Clip URL",
        "Video Timestamp (sec)"
    ])
    
    for d in defects:
        road = roads_map.get(d.get("road_id"), {})
        writer.writerow([
            d.get("id"),
            d.get("road_id"),
            d.get("road_name"),
            d.get("ward_no"),
            d.get("road_type"),
            road.get("width_feet", "N/A"),
            d.get("category"),
            d.get("asset_type"),
            d.get("condition"),
            d.get("severity"),
            d.get("latitude"),
            d.get("longitude"),
            d.get("chainage_km"),
            d.get("sla_hours"),
            d.get("assigned_officer"),
            d.get("status"),
            d.get("reported_date"),
            d.get("image_url"),
            d.get("video_url"),
            d.get("video_timestamp_sec")
        ])
        
    return output.getvalue()

def generate_html_printable_report(ward_filter=None, road_type_filter=None):
    """
    Generates a high-quality printable HTML report (which can be saved as PDF via browser print).
    """
    filters = {}
    if ward_filter:
        filters["ward"] = ward_filter
    if road_type_filter:
        filters["road_type"] = road_type_filter
        
    defects = get_all_defects(filters)
    roads = get_all_roads()
    if ward_filter:
        roads = [r for r in roads if str(r.get("ward_no")) == str(ward_filter)]
    if road_type_filter:
        roads = [r for r in roads if r.get("road_type") == road_type_filter]
        
    total_km = sum(r.get("length_km", 0) for r in roads)
    critical_defects = [d for d in defects if d.get("severity") == "Critical"]
    drainage_defects = [d for d in defects if d.get("category") == "Drainage"]
    missing_assets = [d for d in defects if d.get("condition") == "Missing"]
    
    rows_html = ""
    for d in defects:
        sev_color = "#ef4444" if d.get("severity") == "Critical" else ("#f59e0b" if d.get("severity") == "High" else "#3b82f6")
        cond_badge = f'<span style="background:{sev_color}; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">{d.get("condition")} ({d.get("severity")})</span>'
        
        rows_html += f"""
        <tr>
            <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">{d.get("id")}</td>
            <td style="padding:8px; border:1px solid #ddd;">{d.get("road_name")}<br><small style="color:#666;">{d.get("road_type")} | Ward {d.get("ward_no")}</small></td>
            <td style="padding:8px; border:1px solid #ddd;"><b>{d.get("asset_type")}</b><br><small>{d.get("category")}</small></td>
            <td style="padding:8px; border:1px solid #ddd;">{cond_badge}</td>
            <td style="padding:8px; border:1px solid #ddd; font-size:12px;">{d.get("latitude")}, {d.get("longitude")}<br><span style="color:#2563eb;">Ch: {d.get("chainage_km")}</span></td>
            <td style="padding:8px; border:1px solid #ddd;">{d.get("assigned_officer")}</td>
            <td style="padding:8px; border:1px solid #ddd;"><b>{d.get("status")}</b><br><small style="color:#ef4444;">SLA: {d.get("sla_hours")}h</small></td>
        </tr>
        """
        
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AI-Based Digital Road Register - Municipal Audit Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.4; }}
        .header {{ border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }}
        .title {{ font-size: 24px; font-weight: bold; color: #1e3a8a; }}
        .subtitle {{ font-size: 14px; color: #64748b; margin-top: 4px; }}
        .stat-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }}
        .stat-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }}
        .stat-val {{ font-size: 26px; font-weight: bold; color: #1e40af; }}
        .stat-lbl {{ font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 5px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }}
        th {{ background: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #cbd5e1; color: #334155; }}
        .print-btn {{ background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 20px; }}
        @media print {{
            .print-btn {{ display: none; }}
            body {{ margin: 10px; }}
        }}
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    
    <div class="header">
        <div>
            <div class="title">MUNICIPAL CORPORATION - DIGITAL ROAD REGISTER</div>
            <div class="subtitle">Automated AI/ML Infrastructure & Drainage Asset Condition Audit Report</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
            <b>Generated:</b> {datetime.now().strftime("%d %B %Y, %H:%M")}<br>
            <b>Ward Filter:</b> {"Ward " + str(ward_filter) if ward_filter else "All Wards"}<br>
            <b>Road Type:</b> {road_type_filter if road_type_filter else "All Road Types"}
        </div>
    </div>
    
    <div class="stat-grid">
        <div class="stat-card">
            <div class="stat-val">{len(roads)}</div>
            <div class="stat-lbl">Surveyed Roads ({total_km:.1f} KM)</div>
        </div>
        <div class="stat-card">
            <div class="stat-val" style="color: #ef4444;">{len(critical_defects)}</div>
            <div class="stat-lbl">Critical Defect Alerts</div>
        </div>
        <div class="stat-card">
            <div class="stat-val" style="color: #0284c7;">{len(drainage_defects)}</div>
            <div class="stat-lbl">Drainage Asset Issues</div>
        </div>
        <div class="stat-card">
            <div class="stat-val" style="color: #dc2626;">{len(missing_assets)}</div>
            <div class="stat-lbl">Missing Covers / Slabs</div>
        </div>
    </div>
    
    <h3 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Defect & Asset Condition Register</h3>
    <table>
        <thead>
            <tr>
                <th>Defect ID</th>
                <th>Road & Ward</th>
                <th>Asset Parameter</th>
                <th>Condition & Severity</th>
                <th>Geo Location</th>
                <th>Nodal Officer</th>
                <th>Action Status</th>
            </tr>
        </thead>
        <tbody>
            {rows_html if rows_html else '<tr><td colspan="7" style="text-align:center; padding:20px;">No defects matching selected filters.</td></tr>'}
        </tbody>
    </table>
    
    <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
        <div>
            <b>System Authentication:</b> AI Automated Inspection Hash #RMC-AI-{datetime.now().strftime("%Y%m%d%H%M")}<br>
            Processed under Road Type Contextual Rules Engine (Type 1, Type 2, Type 3)
        </div>
        <div style="text-align: center;">
            <div style="height: 40px;"></div>
            <b>Superintending / Nodal Engineer</b><br>
            Road & Drainage Maintenance Division
        </div>
    </div>
</body>
</html>
"""
    return html

