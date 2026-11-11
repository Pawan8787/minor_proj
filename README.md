# AI-Based Digital Road Register & Asset Management System

Comprehensive municipal software solution designed for **Raipur Municipal Corporation (RMC)** implementing the complete specification for the **AI-Based Digital Road Register**.

---

## 🌟 Implemented Features According to Problem Statement

### 1. Drainage Asset Detection
- **Drain Cover Slabs**: AI-based detection classifying slab conditions into **`Good`**, **`Damaged`**, or **`Missing`** (zero-tolerance safety priority).
- **Water Stagnation Identification**: Automated identification of ponding and water accumulation adjacent to the carriageway.
- **Encroachment Detection Over Drains**: Detects commercial or structural blockages over stormwater channels.
- **Manhole Cover Assessment**: AI condition evaluation classifying manholes into **`Good`**, **`Damaged`**, or **`Missing`**.

### 2. Automated Data Processing & Contextual Road-Type Analysis
- **One-Click Video Survey Ingestion**: Single-click processing of dashcam/survey video streams with synchronized frame timestamps and GPS telemetry.
- **Contextual Road Classification Hierarchy**:
  | Road Type | Classification | Width Criteria | Traffic Profile |
  | :--- | :--- | :--- | :--- |
  | **Type 1** | Major Arterial Roads | Width **&gt; 80 feet** | High Speed / Heavy Flow |
  | **Type 2** | City Main Roads | Width **40 to 80 feet** | Medium / Mixed Urban |
  | **Type 3** | Ward / Internal Roads | Width **&lt; 40 feet** | Low / Neighborhood Residential |
- **Annexure A Parameter Scope**: Pavement defects (potholes, cracks), kerb, median, footpath, crash barriers, regulatory signage, road markings & lane lines, street lighting outages, unauthorized activities, and cleanliness/debris.

### 3. Cloud-Based Management Dashboard & Interactive Map
- **Digital Road Register**: Master registry mapping road corridors to Municipal Wards (Ward 1 - 70), surface types, length (km), condition index scores, and assigned Nodal Officer contacts (phone, email).
- **Colour-Coded Visualisation**: Map markers and register badges dynamically color-coded by condition assessment:
  - 🟢 **Green**: Good / Minor
  - 🟡 **Amber**: Moderate / Fair (High Priority)
  - 🔴 **Red**: Critical / Damaged / Missing (Emergency SLA)
- **Geo-Tagged Image & Video Playback**: Clicking any defect marker displays the GPS coordinates, chainage, high-resolution defect snapshot, and an embedded video player synchronized to the exact survey timestamp.
- **Interactive Dashboard-to-Map Drill-Down**: Clicking any executive metric card on the dashboard deep-links and pre-filters the map view and defect feed.
- **Road-Type Contextual Rules Engine**: Interactive administrator panel to configure SLA hours, depth/fade tolerances, and priority weights across Type 1, 2, and 3 classifications.
- **Downloadable Reports & Ward-Wise Filtering**: Instant Excel/CSV export and formatted printable PDF audit reports with ward-level filters.
- **Role-Based Access Control (RBAC)**: Defined roles for `RMC_Officer` (Executive Engineer), `Admin`, `Field_Engineer`, and `Viewer` with live role switching.

---

## 🚀 Running the Application

### 1. Backend API (Flask)
```bash
cd Backend
uv run --with flask python3 main.py
# Server runs at http://localhost:4000
```

### 2. Frontend Application (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Access UI at http://localhost:5173
```
