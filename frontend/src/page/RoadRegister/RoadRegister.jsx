import React, { useState, useEffect } from 'react';
import { getRoads, createRoad } from '../../services/api';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './RoadRegister.css';

export default function RoadRegister() {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoadDetail, setSelectedRoadDetail] = useState(null);

  const { currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  // Form state for adding road
  const [newRoad, setNewRoad] = useState({
    name: '',
    ward_no: '12',
    ward_name: '',
    width_feet: '85',
    surface_type: 'Bituminous / Asphalt',
    length_km: '5.0',
    zone: 'Central Zone 3',
    start_point: '',
    end_point: '',
    officer_name: 'Er. Rajesh Verma',
    officer_designation: 'Executive Engineer (EE)',
    officer_phone: '+91 98261 44521',
    officer_email: 'rajesh.verma@rmcraipur.gov.in'
  });

  useEffect(() => {
    fetchRoads();
  }, [selectedWard, selectedType]);

  const fetchRoads = async () => {
    setLoading(true);
    const filters = {};
    if (selectedWard) filters.ward = selectedWard;
    if (selectedType) filters.road_type = selectedType;
    const data = await getRoads(filters);
    setRoads(data);
    setLoading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const width = parseFloat(newRoad.width_feet);
    let road_type = 'Type 3';
    let classification = 'Ward / Internal Road';
    if (width > 80) {
      road_type = 'Type 1';
      classification = 'Major Arterial Road';
    } else if (width >= 40) {
      road_type = 'Type 2';
      classification = 'City Main Road';
    }

    const payload = {
      ...newRoad,
      road_type,
      classification,
      width_feet: width,
      length_km: parseFloat(newRoad.length_km),
      condition_score: 85,
      condition_status: 'Good',
      officer: {
        name: newRoad.officer_name,
        designation: newRoad.officer_designation,
        phone: newRoad.officer_phone,
        email: newRoad.officer_email
      }
    };

    await createRoad(payload, currentUser.role);
    setShowAddModal(false);
    fetchRoads();
  };

  const filteredRoads = roads.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.ward_name && r.ward_name.toLowerCase().includes(q)) ||
      r.officer.name.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status) => {
    if (status === 'Good') return 'badge-good';
    if (status === 'Fair') return 'badge-fair';
    return 'badge-critical';
  };

  const getTypeBadgeClass = (type) => {
    if (type === 'Type 1') return 'badge-type1';
    if (type === 'Type 2') return 'badge-type2';
    return 'badge-type3';
  };

  return (
    <div className="register-container">
      {/* Top Banner */}
      <div className="register-header">
        <div>
          <h2>🏛️ Digital Road Register & Asset Directory</h2>
          <p className="subtitle">
            Raipur Municipal Corporation — Contextual Road Classification, Ward Mapping & Nodal Officer Directory
          </p>
        </div>
        <div className="header-actions">
          {hasPermission('manage_register') && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              ➕ Register New Road
            </button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/reports')}>
            📑 Download Register Report
          </button>
        </div>
      </div>

      {/* Road Classification Legend */}
      <div className="classification-guide">
        <div className="guide-card type1-card">
          <span className="badge-type1">Type 1</span>
          <strong>Major Arterial Roads</strong>
          <span className="criteria">Width &gt; 80 feet</span>
        </div>
        <div className="guide-card type2-card">
          <span className="badge-type2">Type 2</span>
          <strong>City Main Roads</strong>
          <span className="criteria">Width 40 to 80 feet</span>
        </div>
        <div className="guide-card type3-card">
          <span className="badge-type3">Type 3</span>
          <strong>Ward / Internal Roads</strong>
          <span className="criteria">Width &lt; 40 feet</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search road name, ID, ward, or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
            <option value="">All Wards (Ward 1 - 70)</option>
            <option value="4">Ward 4 - Mahamaya Mandir</option>
            <option value="7">Ward 7 - Shaheed Bhagat Singh</option>
            <option value="12">Ward 12 - Swami Vivekananda</option>
            <option value="14">Ward 14 - Pt. Ravishankar Shukla</option>
            <option value="18">Ward 18 - Dr. Rajendra Prasad</option>
            <option value="22">Ward 22 - Kasturba Gandhi</option>
          </select>

          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">All Road Types</option>
            <option value="Type 1">Type 1 (Arterial &gt; 80ft)</option>
            <option value="Type 2">Type 2 (City Main 40-80ft)</option>
            <option value="Type 3">Type 3 (Ward / Internal &lt; 40ft)</option>
          </select>
        </div>
      </div>

      {/* Road Register Data Table */}
      <div className="table-wrapper">
        <table className="register-table">
          <thead>
            <tr>
              <th>Road ID & Name</th>
              <th>Ward Classification</th>
              <th>Road Type & Width</th>
              <th>Surface & Length</th>
              <th>Condition Index</th>
              <th>Assigned Nodal Officer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Loading Digital Road Register...</td>
              </tr>
            ) : filteredRoads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No roads found matching criteria.</td>
              </tr>
            ) : (
              filteredRoads.map((road) => (
                <tr key={road.id} className="road-row">
                  <td>
                    <strong>{road.name}</strong>
                    <div className="id-sub">{road.id}</div>
                  </td>
                  <td>
                    <strong>Ward {road.ward_no}</strong>
                    <div className="ward-sub">{road.ward_name} ({road.zone})</div>
                  </td>
                  <td>
                    <span className={getTypeBadgeClass(road.road_type)}>{road.road_type}</span>
                    <div className="width-sub">{road.width_feet} ft wide &bull; {road.classification}</div>
                  </td>
                  <td>
                    <span>{road.surface_type}</span>
                    <div className="length-sub">{road.length_km} km</div>
                  </td>
                  <td>
                    <div className="condition-cell">
                      <span className={`status-pill ${getStatusBadgeClass(road.condition_status)}`}>
                        {road.condition_status} ({road.condition_score}%)
                      </span>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${road.condition_score}%`,
                            backgroundColor:
                              road.condition_score >= 80 ? '#22c55e' : road.condition_score >= 50 ? '#eab308' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="officer-info">
                      <strong>{road.officer?.name}</strong>
                      <div className="officer-desig">{road.officer?.designation}</div>
                      <div className="officer-links">
                        <a href={`tel:${road.officer?.phone}`}>📞 {road.officer?.phone}</a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action view"
                        onClick={() => setSelectedRoadDetail(road)}
                        title="View Road Details & Defect Logs"
                      >
                        👁️ Details
                      </button>
                      <button
                        className="btn-action map-link"
                        onClick={() => navigate(`/map?ward=${road.ward_no}&road_type=${encodeURIComponent(road.road_type)}`)}
                        title="View on Map"
                      >
                        🗺️ Map
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Road Details & Defects Drill-Down */}
      {selectedRoadDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedRoadDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRoadDetail.name} ({selectedRoadDetail.id})</h3>
              <button className="close-btn" onClick={() => setSelectedRoadDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><b>Classification:</b> {selectedRoadDetail.classification} ({selectedRoadDetail.road_type})</div>
                <div><b>Road Width:</b> {selectedRoadDetail.width_feet} feet</div>
                <div><b>Ward:</b> Ward {selectedRoadDetail.ward_no} ({selectedRoadDetail.ward_name})</div>
                <div><b>Zone:</b> {selectedRoadDetail.zone}</div>
                <div><b>Surface:</b> {selectedRoadDetail.surface_type}</div>
                <div><b>Length:</b> {selectedRoadDetail.length_km} KM</div>
                <div><b>Condition Score:</b> {selectedRoadDetail.condition_score}% ({selectedRoadDetail.condition_status})</div>
                <div><b>Chainage Extents:</b> {selectedRoadDetail.start_point || 'Chainage 0.000'} to {selectedRoadDetail.end_point || 'End'}</div>
              </div>

              <div className="officer-card-modal">
                <h4>👷‍♂️ Responsible Nodal Officer</h4>
                <p><b>{selectedRoadDetail.officer?.name}</b> — {selectedRoadDetail.officer?.designation}</p>
                <p>📞 Phone: <a href={`tel:${selectedRoadDetail.officer?.phone}`}>{selectedRoadDetail.officer?.phone}</a></p>
                <p>✉️ Email: <a href={`mailto:${selectedRoadDetail.officer?.email}`}>{selectedRoadDetail.officer?.email}</a></p>
              </div>

              <div className="modal-actions-bar">
                <button
                  className="btn-primary"
                  onClick={() => {
                    navigate(`/map?ward=${selectedRoadDetail.ward_no}&road_type=${encodeURIComponent(selectedRoadDetail.road_type)}`);
                  }}
                >
                  📍 Deep-Link to Road Map & Image Gallery
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    navigate(`/uploadvideo?road_id=${selectedRoadDetail.id}&width=${selectedRoadDetail.width_feet}`);
                  }}
                >
                  📹 Run AI Survey on this Road
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Road */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Road Corridor</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Road Name / Corridor Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road No. 1 Expansion"
                  value={newRoad.name}
                  onChange={(e) => setNewRoad({ ...newRoad, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Road Width (Feet)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100 for Type 1, 60 for Type 2, 30 for Type 3"
                    value={newRoad.width_feet}
                    onChange={(e) => setNewRoad({ ...newRoad, width_feet: e.target.value })}
                  />
                  <small className="help-text">
                    &gt;80ft = Type 1 (Arterial) | 40-80ft = Type 2 (Main) | &lt;40ft = Type 3 (Internal)
                  </small>
                </div>
                <div className="form-group">
                  <label>Length (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newRoad.length_km}
                    onChange={(e) => setNewRoad({ ...newRoad, length_km: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ward Number</label>
                  <input
                    type="number"
                    required
                    value={newRoad.ward_no}
                    onChange={(e) => setNewRoad({ ...newRoad, ward_no: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ward Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swami Vivekananda Ward"
                    value={newRoad.ward_name}
                    onChange={(e) => setNewRoad({ ...newRoad, ward_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Surface Type</label>
                  <select
                    value={newRoad.surface_type}
                    onChange={(e) => setNewRoad({ ...newRoad, surface_type: e.target.value })}
                  >
                    <option value="Bituminous / Asphalt">Bituminous / Asphalt</option>
                    <option value="Concrete Pavement">Concrete Pavement</option>
                    <option value="Paver Block">Paver Block</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Zone</label>
                  <input
                    type="text"
                    value={newRoad.zone}
                    onChange={(e) => setNewRoad({ ...newRoad, zone: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ marginTop: '15px', color: '#1e3a8a' }}>Responsible Nodal Officer</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Officer Name</label>
                  <input
                    type="text"
                    required
                    value={newRoad.officer_name}
                    onChange={(e) => setNewRoad({ ...newRoad, officer_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    required
                    value={newRoad.officer_designation}
                    onChange={(e) => setNewRoad({ ...newRoad, officer_designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newRoad.officer_phone}
                    onChange={(e) => setNewRoad({ ...newRoad, officer_phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={newRoad.officer_email}
                    onChange={(e) => setNewRoad({ ...newRoad, officer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save to Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

