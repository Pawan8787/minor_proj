import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { getDefects, updateDefectStatus } from '../../services/api';
import './style.css';

export default function MapComponent() {
  const [defects, setDefects] = useState([]);
  const [filteredDefects, setFilteredDefects] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Read query params from URL (from Dashboard drill-down deep-links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('category')) setSelectedCategory(params.get('category'));
    if (params.get('condition')) setSelectedCondition(params.get('condition'));
    if (params.get('severity')) setSelectedSeverity(params.get('severity'));
    if (params.get('ward')) setSelectedWard(params.get('ward'));
  }, [location.search]);

  // Load defects data
  useEffect(() => {
    async function loadData() {
      const data = await getDefects();
      setDefects(data);
    }
    loadData();
  }, []);

  // Filter defects
  useEffect(() => {
    let result = [...defects];
    if (selectedCategory) {
      result = result.filter((d) => d.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedCondition) {
      result = result.filter((d) => d.condition.toLowerCase() === selectedCondition.toLowerCase());
    }
    if (selectedSeverity) {
      result = result.filter((d) => d.severity.toLowerCase() === selectedSeverity.toLowerCase());
    }
    if (selectedWard) {
      result = result.filter((d) => String(d.ward_no) === String(selectedWard));
    }
    setFilteredDefects(result);
  }, [defects, selectedCategory, selectedCondition, selectedSeverity, selectedWard]);

  // Color coding helper based on Condition & Severity Assessment
  const getConditionColor = (defect) => {
    if (defect.condition === 'Missing' || defect.severity === 'Critical') {
      return '#ef4444'; // Red (Critical / Missing)
    }
    if (defect.condition === 'Damaged' || defect.severity === 'High') {
      return '#f59e0b'; // Amber / Orange (Moderate / Damaged)
    }
    return '#22c55e'; // Green (Good / Minor)
  };

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [81.635, 21.248], // Raipur Municipal Center
        zoom: 12
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.on('load', () => {
        setMapLoaded(true);
      });

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('Mapbox initialization notice:', err);
      setMapLoaded(true);
    }
  }, []);

  // Update map markers whenever filtered defects change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredDefects.forEach((defect) => {
      const color = getConditionColor(defect);

      // Create custom HTML element for marker
      const el = document.createElement('div');
      el.className = 'custom-map-marker';
      el.style.backgroundColor = color;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.title = `${defect.asset_type} - ${defect.condition}`;

      el.addEventListener('click', () => {
        setSelectedDefect(defect);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [defect.longitude, defect.latitude], zoom: 14 });
        }
      });

      try {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([defect.longitude, defect.latitude])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      } catch (e) {
        console.warn('Marker placement note:', e);
      }
    });
  }, [filteredDefects, mapLoaded]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedDefect) return;
    await updateDefectStatus(selectedDefect.id, newStatus);
    setSelectedDefect({ ...selectedDefect, status: newStatus });
    // Update local list
    setDefects((prev) =>
      prev.map((d) => (d.id === selectedDefect.id ? { ...d, status: newStatus } : d))
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedSeverity('');
    setSelectedWard('');
    navigate('/map');
  };

  return (
    <div className="map-view-container">
      {/* Top Filter and Drill-Down Bar */}
      <div className="map-filter-banner">
        <div className="filter-group">
          <label>Ward:</label>
          <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
            <option value="">All Wards (1-70)</option>
            <option value="4">Ward 4 (Mahamaya)</option>
            <option value="7">Ward 7 (Station/Pandri)</option>
            <option value="12">Ward 12 (GE Road)</option>
            <option value="14">Ward 14 (Telibandha)</option>
            <option value="18">Ward 18 (VIP Expressway)</option>
            <option value="22">Ward 22 (Shankar Nagar)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Drainage">🌊 Drainage Assets</option>
            <option value="Pavement">🛣️ Pavement & Cracks</option>
            <option value="Kerb & Footpath">🚶 Kerb & Footpath</option>
            <option value="Signage & Safety">🛑 Signage & Safety</option>
            <option value="Road Markings">➖ Road Markings</option>
            <option value="Street Lighting">💡 Street Lighting</option>
            <option value="Cleanliness & Debris">🧹 Cleanliness & Debris</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Condition:</label>
          <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
            <option value="">All Conditions</option>
            <option value="Missing">Missing</option>
            <option value="Damaged">Damaged</option>
            <option value="Good">Good</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="Critical">🔴 Critical Alert</option>
            <option value="High">🟠 High Priority</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        {(selectedCategory || selectedCondition || selectedSeverity || selectedWard) && (
          <button className="btn-clear-filters" onClick={clearAllFilters}>
            ✖ Reset Drill-Down
          </button>
        )}

        <div className="legend-indicator">
          <span className="dot red"></span> Critical / Missing
          <span className="dot yellow"></span> Damaged / High
          <span className="dot green"></span> Good / Minor
        </div>
      </div>

      <div className="map-content-split">
        {/* Map Canvas */}
        <div className="map-wrapper" ref={mapContainerRef}>
          {/* Fallback Pin Overlay if Mapbox WebGL has display issues */}
          <div className="map-overlay-badge">
            🗺️ {filteredDefects.length} Defects Visualized &bull; Color-Coded by Condition
          </div>
        </div>

        {/* Geo-Tagged Image & Video Viewing Inspection Sidebar */}
        <div className="map-inspector-sidebar">
          {selectedDefect ? (
            <div className="defect-detail-panel">
              <div className="panel-header">
                <div>
                  <span className={`pill-sev ${selectedDefect.severity.toLowerCase()}`}>
                    {selectedDefect.condition} ({selectedDefect.severity})
                  </span>
                  <h4>{selectedDefect.asset_type}</h4>
                </div>
                <button className="btn-close-panel" onClick={() => setSelectedDefect(null)}>
                  &times;
                </button>
              </div>

              {/* Geo-tagged Photo */}
              <div className="media-section">
                <div className="section-label">📸 Geo-Tagged Inspection Photo</div>
                <div className="image-frame">
                  <img src={selectedDefect.image_url} alt={selectedDefect.asset_type} />
                  <div className="geo-tag-overlay">
                    📍 {selectedDefect.latitude}, {selectedDefect.longitude} &bull; Ch: {selectedDefect.chainage_km}
                  </div>
                </div>
              </div>

              {/* Geo-Tagged Video Clip Player */}
              <div className="media-section">
                <div className="section-label">
                  📹 Geo-Tagged Survey Video Playback ({selectedDefect.video_timestamp_sec}s)
                </div>
                <video
                  className="defect-video-player"
                  controls
                  autoPlay
                  muted
                  src={selectedDefect.video_url}
                  key={selectedDefect.id}
                >
                  Your browser does not support video playback.
                </video>
                <div className="video-sub">
                  Survey vehicle telemetry synchronized at {selectedDefect.video_timestamp_sec} sec
                </div>
              </div>

              {/* Metadata & Officer */}
              <div className="metadata-table">
                <div className="meta-row">
                  <span className="meta-k">Road Corridor:</span>
                  <span className="meta-v"><b>{selectedDefect.road_name}</b> ({selectedDefect.road_type})</span>
                </div>
                <div className="meta-row">
                  <span className="meta-k">Ward:</span>
                  <span className="meta-v">Ward {selectedDefect.ward_no}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-k">Description:</span>
                  <span className="meta-v">{selectedDefect.description}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-k">SLA Target:</span>
                  <span className="meta-v sla-highlight">{selectedDefect.sla_hours} Hours</span>
                </div>
                <div className="meta-row">
                  <span className="meta-k">Assigned Officer:</span>
                  <span className="meta-v">{selectedDefect.assigned_officer}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-k">Action Status:</span>
                  <span className="meta-v">
                    <select
                      className="status-selector"
                      value={selectedDefect.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="Open">Open (Pending)</option>
                      <option value="In Progress">In Progress (Work Order Dispatched)</option>
                      <option value="Resolved">Resolved (Repaired)</option>
                    </select>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="sidebar-empty">
              <div className="empty-icon">📍</div>
              <h3>Interactive Map Inspector</h3>
              <p>Click on any color-coded marker on the map to view:</p>
              <ul>
                <li>Geo-tagged high-resolution defect snapshot</li>
                <li>Survey video playback linked to exact chainage</li>
                <li>Responsible Nodal Officer contact</li>
                <li>Contextual SLA & resolution workflow</li>
              </ul>

              <div className="defect-quick-list">
                <h4>Filtered Defects in View ({filteredDefects.length})</h4>
                {filteredDefects.map((d) => (
                  <div
                    key={d.id}
                    className="quick-item"
                    style={{ borderLeft: `4px solid ${getConditionColor(d)}` }}
                    onClick={() => {
                      setSelectedDefect(d);
                      if (mapRef.current) {
                        mapRef.current.flyTo({ center: [d.longitude, d.latitude], zoom: 14 });
                      }
                    }}
                  >
                    <strong>{d.asset_type}</strong> ({d.condition})
                    <div className="quick-sub">{d.road_name} &bull; Ward {d.ward_no}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
