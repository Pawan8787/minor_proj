import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getDefects } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [criticalDefects, setCriticalDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const sum = await getDashboardSummary();
      setSummary(sum);
      const crits = await getDefects({ severity: 'Critical' });
      setCriticalDefects(crits);
      setLoading(false);
    }
    loadData();
  }, []);

  // Drill-down handler: deep-links to Map with appropriate query filters
  const handleDrillDown = (filterType, filterValue) => {
    const params = new URLSearchParams();
    if (filterType === 'category') params.set('category', filterValue);
    if (filterType === 'condition') params.set('condition', filterValue);
    if (filterType === 'severity') params.set('severity', filterValue);
    if (filterType === 'asset_type') params.set('asset_type', filterValue);
    navigate(`/map?${params.toString()}`);
  };

  return (
    <div className="dashboard-container">
      {/* Title & Municipal Banner */}
      <div className="dashboard-header">
        <div>
          <h2>📊 Municipal Infrastructure Executive Dashboard</h2>
          <p className="subtitle">
            Raipur Smart City Digital Road Register — AI Defect Telemetry & Drainage Condition Analytics
          </p>
        </div>
        <div className="dash-quick-btns">
          <button className="btn-dash" onClick={() => navigate('/register')}>
            🏛️ Road Register
          </button>
          <button className="btn-dash" onClick={() => navigate('/uploadvideo')}>
            🤖 One-Click AI Survey
          </button>
          <button className="btn-dash" onClick={() => navigate('/reports')}>
            📑 Audit Reports
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading Municipal Dashboard Metrics...</div>
      ) : (
        <>
          {/* Summary Metric Cards (Interactive Drill-Down) */}
          <div className="metrics-grid">
            {/* Total Road Length */}
            <div className="metric-card primary" onClick={() => navigate('/register')}>
              <div className="card-icon">🛣️</div>
              <div className="card-info">
                <div className="metric-num">{summary?.total_length_km || 37.1} <span className="unit">KM</span></div>
                <div className="metric-title">Surveyed Network ({summary?.total_roads} Roads)</div>
                <div className="drill-hint">Click to view Digital Road Register &rarr;</div>
              </div>
            </div>

            {/* Critical Defect Alerts */}
            <div className="metric-card danger" onClick={() => handleDrillDown('severity', 'Critical')}>
              <div className="card-icon">🚨</div>
              <div className="card-info">
                <div className="metric-num">{summary?.critical_defects_count || 5}</div>
                <div className="metric-title">Critical Safety Defect Alerts</div>
                <div className="drill-hint">Click to deep-link to Filtered Map &rarr;</div>
              </div>
            </div>

            {/* Drainage Asset Issues */}
            <div className="metric-card cyan" onClick={() => handleDrillDown('category', 'Drainage')}>
              <div className="card-icon">🌊</div>
              <div className="card-info">
                <div className="metric-num">{summary?.drainage_issues_count || 6}</div>
                <div className="metric-title">Drainage Asset Detections</div>
                <div className="drill-hint">Click to filter Drainage issues &rarr;</div>
              </div>
            </div>

            {/* Missing Manhole & Drain Covers */}
            <div className="metric-card red-outline" onClick={() => handleDrillDown('condition', 'Missing')}>
              <div className="card-icon">⚠️</div>
              <div className="card-info">
                <div className="metric-num">{summary?.missing_covers_count || 2}</div>
                <div className="metric-title">Missing Drain Slabs & Manholes</div>
                <div className="drill-hint">Zero Tolerance SLA (12-24h) &rarr;</div>
              </div>
            </div>

            {/* Water Stagnation Spots */}
            <div className="metric-card blue-outline" onClick={() => handleDrillDown('asset_type', 'Water Stagnation')}>
              <div className="card-icon">💧</div>
              <div className="card-info">
                <div className="metric-num">{summary?.water_stagnation_count || 1}</div>
                <div className="metric-title">Water Stagnation Spots</div>
                <div className="drill-hint">Click to view on Map &rarr;</div>
              </div>
            </div>

            {/* Drain Encroachments */}
            <div className="metric-card orange-outline" onClick={() => handleDrillDown('asset_type', 'Encroachment Over Drain')}>
              <div className="card-icon">🚧</div>
              <div className="card-info">
                <div className="metric-num">{summary?.encroachment_count || 1}</div>
                <div className="metric-title">Encroachments Over Drains</div>
                <div className="drill-hint">Commercial/Structure blocks &rarr;</div>
              </div>
            </div>
          </div>

          {/* Road Type Hierarchy & Distribution */}
          <div className="hierarchy-section">
            <div className="hierarchy-header">
              <h3>Road Network Classification & Contextual Criteria</h3>
              <button className="btn-link" onClick={() => navigate('/rules-engine')}>
                ⚙️ View / Edit Contextual Rules Engine
              </button>
            </div>
            <div className="hierarchy-cards">
              <div className="hier-card type1" onClick={() => navigate('/register?type=Type 1')}>
                <div className="hier-badge type1">Type 1</div>
                <h4>Major Arterial Roads</h4>
                <p className="criteria-text">Width &gt; 80 Feet &bull; High Traffic Corridors</p>
                <div className="count-stat">2 Active Corridors (23.7 KM)</div>
                <div className="sla-tag">Strictest SLA: 12-24 Hours</div>
              </div>

              <div className="hier-card type2" onClick={() => navigate('/register?type=Type 2')}>
                <div className="hier-badge type2">Type 2</div>
                <h4>City Main Roads</h4>
                <p className="criteria-text">Width 40 to 80 Feet &bull; Mixed Urban Traffic</p>
                <div className="count-stat">2 Active Corridors (9.5 KM)</div>
                <div className="sla-tag">Standard SLA: 24-48 Hours</div>
              </div>

              <div className="hier-card type3" onClick={() => navigate('/register?type=Type 3')}>
                <div className="hier-badge type3">Type 3</div>
                <h4>Ward / Internal Roads</h4>
                <p className="criteria-text">Width &lt; 40 Feet &bull; Residential Neighborhoods</p>
                <div className="count-stat">2 Active Lanes (3.9 KM)</div>
                <div className="sla-tag">Ward Maintenance SLA: 36-72 Hours</div>
              </div>
            </div>
          </div>

          {/* Critical Attention Defect Table with Geo Video Links */}
          <div className="critical-section">
            <div className="critical-header">
              <h3>🚨 Priority Defect & Asset Attention Feed (Deep-Link to Map & Video)</h3>
              <button className="btn-viewall" onClick={() => navigate('/map')}>
                Explore Full Interactive Map &rarr;
              </button>
            </div>

            <div className="critical-table-wrapper">
              <table className="critical-table">
                <thead>
                  <tr>
                    <th>Defect ID</th>
                    <th>Asset Category</th>
                    <th>Road & Ward</th>
                    <th>Condition / Severity</th>
                    <th>Chainage & GPS</th>
                    <th>Responsible Officer</th>
                    <th>Deep-Link Action</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalDefects.slice(0, 5).map((def) => (
                    <tr key={def.id}>
                      <td><strong>{def.id}</strong></td>
                      <td>
                        <span className="cat-pill">{def.category}</span>
                        <div className="asset-sub">{def.asset_type}</div>
                      </td>
                      <td>
                        <b>{def.road_name}</b>
                        <div className="ward-sub">Ward {def.ward_no} ({def.road_type})</div>
                      </td>
                      <td>
                        <span className="badge-critical">{def.condition} ({def.severity})</span>
                      </td>
                      <td>
                        <div className="gps-text">{def.latitude}, {def.longitude}</div>
                        <div className="chainage-text">Ch: {def.chainage_km}</div>
                      </td>
                      <td>{def.assigned_officer}</td>
                      <td>
                        <button
                          className="btn-drilldown-action"
                          onClick={() => navigate(`/map?ward=${def.ward_no}&asset_type=${encodeURIComponent(def.asset_type)}`)}
                        >
                          🗺️ View Geo-Video
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

