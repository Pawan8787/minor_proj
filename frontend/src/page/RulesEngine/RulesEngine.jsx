import React, { useState, useEffect } from 'react';
import { getRules, saveRules } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './RulesEngine.css';

export default function RulesEngine() {
  const [rules, setRules] = useState(null);
  const [activeTab, setActiveTab] = useState('Type 1');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const { currentUser, hasPermission } = useAuth();

  useEffect(() => {
    async function load() {
      const data = await getRules();
      setRules(data);
    }
    load();
  }, []);

  const handleSlaChange = (roadType, key, value) => {
    setRules((prev) => ({
      ...prev,
      [roadType]: {
        ...prev[roadType],
        sla_hours: {
          ...prev[roadType].sla_hours,
          [key]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleToleranceChange = (roadType, key, value) => {
    setRules((prev) => ({
      ...prev,
      [roadType]: {
        ...prev[roadType],
        tolerances: {
          ...prev[roadType].tolerances,
          [key]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    await saveRules(rules, currentUser.role);
    setSaving(false);
    setSaveMessage('✅ Contextual rules engine parameters saved successfully!');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  if (!rules) {
    return <div className="rules-loading">Loading Contextual Rules Engine...</div>;
  }

  const currentRule = rules[activeTab];

  return (
    <div className="rules-engine-container">
      {/* Title */}
      <div className="rules-header">
        <div>
          <h2>⚙️ Road-Type-Based Contextual Rules Engine</h2>
          <p className="subtitle">
            Configure defect severity criteria, SLA targets, and tolerance thresholds customized per road classification
          </p>
        </div>
        <div className="rules-actions">
          {hasPermission('all') ? (
            <button className="btn-save-rules" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Rules Configuration'}
            </button>
          ) : (
            <div className="rbac-notice">🔒 Read-Only (Admin Access Required to Modify Rules)</div>
          )}
        </div>
      </div>

      {saveMessage && <div className="save-alert">{saveMessage}</div>}

      {/* Road Classification Tabs */}
      <div className="classification-tabs">
        <button
          className={`tab-btn ${activeTab === 'Type 1' ? 'active type1' : ''}`}
          onClick={() => setActiveTab('Type 1')}
        >
          <span className="tab-pill type1">Type 1</span>
          <div>
            <strong>Major Arterial Roads</strong>
            <small>Width &gt; 80 Feet &bull; Expressways & Major Corridors</small>
          </div>
        </button>

        <button
          className={`tab-btn ${activeTab === 'Type 2' ? 'active type2' : ''}`}
          onClick={() => setActiveTab('Type 2')}
        >
          <span className="tab-pill type2">Type 2</span>
          <div>
            <strong>City Main Roads</strong>
            <small>Width 40 to 80 Feet &bull; Commercial Avenues & Link Roads</small>
          </div>
        </button>

        <button
          className={`tab-btn ${activeTab === 'Type 3' ? 'active type3' : ''}`}
          onClick={() => setActiveTab('Type 3')}
        >
          <span className="tab-pill type3">Type 3</span>
          <div>
            <strong>Ward / Internal Roads</strong>
            <small>Width &lt; 40 Feet &bull; Residential Streets & Internal Lanes</small>
          </div>
        </button>
      </div>

      {/* Rules Configuration Panels */}
      <div className="rules-content-card">
        <div className="card-top-info">
          <h3>Contextual Parameters for {currentRule.name} ({activeTab})</h3>
          <p>
            Traffic Profile: <b>{currentRule.traffic_density}</b> &bull; Width Criteria:{' '}
            <b>{activeTab === 'Type 1' ? '> 80 ft' : activeTab === 'Type 2' ? '40 to 80 ft' : '< 40 ft'}</b>
          </p>
        </div>

        {/* Section 1: Drainage & Safety SLA Targets */}
        <div className="rules-section">
          <h4>⏱️ Resolution SLA Target Hours (By Asset Type)</h4>
          <div className="rules-grid">
            <div className="rule-field">
              <label>Missing Manhole Cover (Zero Tolerance):</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.missing_manhole || 24}
                  onChange={(e) => handleSlaChange(activeTab, 'missing_manhole', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Missing / Broken Drain Cover Slab:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.missing_drain_slab || 24}
                  onChange={(e) => handleSlaChange(activeTab, 'missing_drain_slab', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Water Stagnation Adjacent to Carriageway:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.water_stagnation || 36}
                  onChange={(e) => handleSlaChange(activeTab, 'water_stagnation', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Critical Pothole (&gt;25mm depth):</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.critical_pothole || 48}
                  onChange={(e) => handleSlaChange(activeTab, 'critical_pothole', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Drain Encroachment Clearance:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.encroachment || 72}
                  onChange={(e) => handleSlaChange(activeTab, 'encroachment', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Street Light Failure / Wiring Hazard:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.sla_hours?.lighting_outage || 48}
                  onChange={(e) => handleSlaChange(activeTab, 'lighting_outage', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Defect Tolerances */}
        <div className="rules-section">
          <h4>📏 Infrastructure Defect Tolerance Limits</h4>
          <div className="rules-grid">
            <div className="rule-field">
              <label>Max Allowable Pothole Depth:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.tolerances?.pothole_depth_max_mm || 30}
                  onChange={(e) => handleToleranceChange(activeTab, 'pothole_depth_max_mm', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>mm</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Max Carriageway Ponding / Stagnation Depth:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.tolerances?.water_stagnation_depth_max_cm || 5}
                  onChange={(e) => handleToleranceChange(activeTab, 'water_stagnation_depth_max_cm', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>cm</span>
              </div>
            </div>

            <div className="rule-field">
              <label>Lane Marking Reflectivity Fade Limit:</label>
              <div className="input-unit">
                <input
                  type="number"
                  value={currentRule.tolerances?.lane_marking_fade_tolerance_pct || 25}
                  onChange={(e) => handleToleranceChange(activeTab, 'lane_marking_fade_tolerance_pct', e.target.value)}
                  disabled={!hasPermission('all')}
                />
                <span>%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-footer-note">
          ℹ️ Under Raipur Municipal Corporation (RMC) contract terms, RMC reserves the right to add, modify,
          or remove contextual parameters during the digital register lifecycle at no additional cost.
        </div>
      </div>
    </div>
  );
}

