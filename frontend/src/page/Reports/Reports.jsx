import React, { useState, useEffect } from 'react';
import { getDefects, getRoads } from '../../services/api';
import './Reports.css';

export default function Reports() {
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedRoadType, setSelectedRoadType] = useState('');
  const [defects, setDefects] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedWard, selectedRoadType]);

  const fetchData = async () => {
    setLoading(true);
    const filter = {};
    if (selectedWard) filter.ward = selectedWard;
    if (selectedRoadType) filter.road_type = selectedRoadType;

    const defs = await getDefects(filter);
    const rds = await getRoads(filter);
    setDefects(defs);
    setRoads(rds);
    setLoading(false);
  };

  const handleDownloadCsv = () => {
    // Generate CSV client-side / call backend
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Defect ID,Road Name,Ward No,Road Type,Category,Asset Type,Condition,Severity,Latitude,Longitude,Chainage,SLA Hours,Assigned Officer,Status\n';

    defects.forEach((d) => {
      csvContent += `"${d.id}","${d.road_name}","${d.ward_no}","${d.road_type}","${d.category}","${d.asset_type}","${d.condition}","${d.severity}","${d.latitude}","${d.longitude}","${d.chainage_km}","${d.sla_hours}","${d.assigned_officer}","${d.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_road_register_ward_${selectedWard || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const criticalCount = defects.filter((d) => d.severity === 'Critical').length;
  const drainageCount = defects.filter((d) => d.category === 'Drainage').length;
  const missingCount = defects.filter((d) => d.condition === 'Missing').length;

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>📑 Municipal Audit Reports & Data Export</h2>
          <p className="subtitle">
            Generate verifiable condition assessment reports and spreadsheets with ward-wise and road-type filters
          </p>
        </div>
        <div className="export-btn-group">
          <button className="btn-export-csv" onClick={handleDownloadCsv}>
            📊 Download Excel / CSV
          </button>
          <button className="btn-export-pdf" onClick={handlePrintPdf}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Ward & Road Type Filter Selector */}
      <div className="reports-filter-card">
        <div className="filter-title">Filter Report Parameters:</div>
        <div className="filter-row">
          <div className="f-col">
            <label>Ward Classification:</label>
            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
              <option value="">All Wards (Raipur City)</option>
              <option value="4">Ward 4 - Mahamaya Mandir</option>
              <option value="7">Ward 7 - Shaheed Bhagat Singh</option>
              <option value="12">Ward 12 - Swami Vivekananda</option>
              <option value="14">Ward 14 - Pt. Ravishankar Shukla</option>
              <option value="18">Ward 18 - Dr. Rajendra Prasad</option>
              <option value="22">Ward 22 - Kasturba Gandhi</option>
            </select>
          </div>

          <div className="f-col">
            <label>Road Classification Hierarchy:</label>
            <select value={selectedRoadType} onChange={(e) => setSelectedRoadType(e.target.value)}>
              <option value="">All Road Types</option>
              <option value="Type 1">Type 1 (Major Arterial &gt; 80ft)</option>
              <option value="Type 2">Type 2 (City Main 40-80ft)</option>
              <option value="Type 3">Type 3 (Ward / Internal &lt; 40ft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards for Report */}
      <div className="report-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-num">{roads.length}</div>
          <div className="kpi-lbl">Corridors Surveyed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-num">{defects.length}</div>
          <div className="kpi-lbl">Total Logged Defects</div>
        </div>
        <div className="kpi-card text-danger">
          <div className="kpi-num">{criticalCount}</div>
          <div className="kpi-lbl">Critical Priority Alerts</div>
        </div>
        <div className="kpi-card text-blue">
          <div className="kpi-num">{drainageCount}</div>
          <div className="kpi-lbl">Drainage Defect Detections</div>
        </div>
        <div className="kpi-card text-darkred">
          <div className="kpi-num">{missingCount}</div>
          <div className="kpi-lbl">Missing Covers / Slabs</div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="report-table-card">
        <h3>Inspection Records ({defects.length} Items)</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Defect ID</th>
              <th>Road & Ward</th>
              <th>Asset Category</th>
              <th>Condition & Severity</th>
              <th>GPS Coordinates</th>
              <th>SLA Target</th>
              <th>Assigned Officer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading Report Data...</td>
              </tr>
            ) : defects.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No records found for selected filter.</td>
              </tr>
            ) : (
              defects.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.id}</strong></td>
                  <td>
                    <b>{d.road_name}</b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{d.road_type} &bull; Ward {d.ward_no}</div>
                  </td>
                  <td>
                    <b>{d.asset_type}</b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{d.category}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: d.severity === 'Critical' ? '#fee2e2' : d.severity === 'High' ? '#ffedd5' : '#dcfce7',
                        color: d.severity === 'Critical' ? '#991b1b' : d.severity === 'High' ? '#9a3412' : '#166534'
                      }}
                    >
                      {d.condition} ({d.severity})
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {d.latitude}, {d.longitude}
                    <div style={{ color: '#2563eb' }}>Ch: {d.chainage_km}</div>
                  </td>
                  <td>{d.assigned_officer}</td>
                  <td><strong>{d.status}</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

