import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runOneClickAiAnalysis } from '../../services/api';
import './Uploadvideo.css';

export default function UploadVideo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [roadWidthFeet, setRoadWidthFeet] = useState(120);
  const [roadId, setRoadId] = useState('ROAD-T1-001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);

  const navigate = useNavigate();

  // Calculate road type contextually based on width criteria
  const getRoadTypeFromWidth = (width) => {
    const w = parseFloat(width);
    if (w > 80) return { type: 'Type 1', name: 'Major Arterial Road', badge: 'type1' };
    if (w >= 40) return { type: 'Type 2', name: 'City Main Road', badge: 'type2' };
    return { type: 'Type 3', name: 'Ward / Internal Road', badge: 'type3' };
  };

  const currentClassification = getRoadTypeFromWidth(roadWidthFeet);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp)$/i.test(file.name);
      setIsImage(isImg);
      setMediaPreview(URL.createObjectURL(file));
      setAnalysisResults(null);
    }
  };

  const handleOneClickProcessing = async () => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStage(isImage 
      ? 'Initializing AI Image Pipeline & Contextual Rules Engine...' 
      : 'Initializing AI Video Pipeline & Contextual Rules Engine...');

    setTimeout(() => {
      setProgressPercent(40);
      setProgressStage(isImage
        ? 'Scanning Road Surface ROI: Detecting Potholes, Cracks & Drainage Assets...'
        : 'Extracting Survey Frames & Analyzing Drainage Assets (Manholes, Drain Slabs, Water Stagnation)...');
    }, 800);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressStage('Applying Raipur Municipal Contextual Rules (Type 1/2/3 SLA & Severity Scoring)...');
    }, 1800);

    setTimeout(async () => {
      setProgressPercent(95);
      setProgressStage('Generating Geo-Tagged Defect Records & Updating Digital Road Register...');

      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('video', selectedFile);
        payload.append('image', selectedFile);
        payload.append('road_id', roadId);
        payload.append('width_feet', roadWidthFeet);
        payload.append('lat', '21.2514');
        payload.append('lng', '81.6296');
      } else {
        payload = {
          road_id: roadId,
          width_feet: roadWidthFeet,
          lat: 21.2514,
          lng: 81.6296
        };
      }

      const results = await runOneClickAiAnalysis(payload);

      setProgressPercent(100);
      setIsProcessing(false);
      setAnalysisResults(results);
    }, 2800);
  };

  return (
    <div className="ai-survey-container">
      {/* Title */}
      <div className="survey-header">
        <div>
          <h2>🤖 Automated One-Click AI Survey & Defect Analysis</h2>
          <p className="subtitle">
            Ingest survey video or road photograph (JPG/PNG), auto-classify road type by width criteria, and detect potholes, cracks, and drainage assets
          </p>
        </div>
      </div>

      <div className="survey-layout">
        {/* Left: Input & Media Preview */}
        <div className="survey-config-card">
          <h3>1. Survey Input & Road Classification</h3>

          <div className="input-group">
            <label>Corridor Road Width (Feet):</label>
            <input
              type="number"
              value={roadWidthFeet}
              onChange={(e) => setRoadWidthFeet(e.target.value)}
              placeholder="e.g. 120"
            />
            {/* Contextual Classification Badge */}
            <div className={`classification-pill ${currentClassification.badge}`}>
              Contextual Classification: <b>{currentClassification.type} — {currentClassification.name}</b>
              <small>
                {currentClassification.type === 'Type 1' && ' (> 80 ft: Major Arterial Corridor Rules applied)'}
                {currentClassification.type === 'Type 2' && ' (40 - 80 ft: City Main Road Rules applied)'}
                {currentClassification.type === 'Type 3' && ' (< 40 ft: Ward / Internal Road Rules applied)'}
              </small>
            </div>
          </div>

          <div className="input-group">
            <label>Select Target Road Corridor:</label>
            <select value={roadId} onChange={(e) => setRoadId(e.target.value)}>
              <option value="ROAD-T1-001">ROAD-T1-001: Great Eastern (GE) Road Corridor (Ward 12)</option>
              <option value="ROAD-T1-002">ROAD-T1-002: VIP Airport Expressway (Ward 18)</option>
              <option value="ROAD-T2-001">ROAD-T2-001: Telibandha - Marine Drive Boulevard (Ward 14)</option>
              <option value="ROAD-T2-002">ROAD-T2-002: Station Road to Pandri Market Link (Ward 7)</option>
              <option value="ROAD-T3-001">ROAD-T3-001: Shankar Nagar Sector 2 Internal Avenue (Ward 22)</option>
              <option value="ROAD-T3-002">ROAD-T3-002: Purani Basti Ward Lane 4 (Ward 4)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Upload Road Photo (JPG/PNG) or Dashcam Video (MP4):</label>
            <input 
              type="file" 
              accept="image/*,video/*,.jpg,.jpeg,.png,.mp4,.mov" 
              onChange={handleFileChange} 
            />
            <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
              💡 Supported: Road photos (JPG, PNG) for direct pothole/defect detection, or full survey dashcam videos.
            </small>
          </div>

          {mediaPreview ? (
            <div className="video-preview-wrapper" style={{ textAlign: 'center', background: '#0f172a', borderRadius: '8px', padding: '10px' }}>
              {isImage ? (
                <img 
                  src={mediaPreview} 
                  alt="Road Survey Preview" 
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '6px' }} 
                />
              ) : (
                <video src={mediaPreview} controls className="survey-video-preview" />
              )}
            </div>
          ) : (
            <div className="sample-video-hint">
              ℹ️ Or run demo analysis using the preloaded High-Definition Municipal Survey footage stream.
            </div>
          )}

          {/* Single-Click AI Processing Button */}
          <button
            className="btn-one-click-process"
            onClick={handleOneClickProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ AI Analysis in Progress...' : (isImage ? '⚡ Analyze Road Photo for Potholes & Defects' : '⚡ Process Survey Media at One Click')}
          </button>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="processing-progress">
              <div className="progress-label">{progressStage}</div>
              <div className="progress-bar-outer">
                <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Detection Output & Parameter Breakdown */}
        <div className="survey-results-card">
          <h3>2. AI-Based Asset & Defect Detection Results</h3>

          {!analysisResults ? (
            <div className="results-placeholder">
              <div className="placeholder-icon">🔍</div>
              <h4>Awaiting Survey Media Ingestion</h4>
              <p>Upload a road photo (JPG/PNG) or dashcam video and click the analyze button to trigger automated detection across:</p>
              <ul className="detection-spec-list">
                <li><b>🌊 Drainage Asset Detection:</b> Drain cover slabs (Good / Damaged / Missing), Water stagnation, Encroachments, Manhole covers (Good / Damaged / Missing).</li>
                <li><b>🛣️ Pavement & Structure:</b> Potholes, rutting, cracking, concrete joint distress.</li>
                <li><b>🛑 Road Safety & Assets:</b> Kerb, median, footpath, crash barriers, signage, road markings, street lighting, and unauthorized activity.</li>
              </ul>
            </div>
          ) : (
            <div className="results-container">
              <div className="results-summary-bar">
                <div>
                  <span className="badge-success">Survey Processed</span>
                  <h4>{analysisResults.defects_detected_count} Infrastructure Detections Logged</h4>
                  <p>
                    Road Type: <b>{analysisResults.road_type}</b> ({analysisResults.classification})
                  </p>
                </div>
                <button
                  className="btn-view-map-results"
                  onClick={() => navigate(`/map?road_type=${encodeURIComponent(analysisResults.road_type)}`)}
                >
                  🗺️ Deep-Link to Map View
                </button>
              </div>

              {/* Detections List */}
              <div className="detections-feed">
                {analysisResults.detections?.length === 0 ? (
                  <div className="results-placeholder" style={{ padding: '24px' }}>
                    <div className="placeholder-icon">✅</div>
                    <h4>No Potholes or Critical Defects Detected</h4>
                    <p>The analyzed road surface appears clear based on current computer vision thresholds.</p>
                  </div>
                ) : (
                  analysisResults.detections?.map((d) => (
                    <div key={d.id} className="detection-result-item">
                      <a href={d.image_url} target="_blank" rel="noreferrer" title="Click to view full annotated image">
                        <img src={d.image_url} alt={d.asset_type} className="detection-thumb" />
                      </a>
                      <div className="detection-details">
                        <div className="det-top">
                          <span className="det-cat">{d.category}</span>
                          <span className={`det-sev ${d.severity.toLowerCase()}`}>
                            {d.condition} ({d.severity})
                          </span>
                        </div>
                        <h5>{d.asset_type}</h5>
                        <p>{d.description}</p>
                        <div className="det-meta">
                          <span>📍 GPS: {d.latitude}, {d.longitude}</span>
                          <span>📏 Ch: {d.chainage_km}</span>
                          <span>⏱️ SLA: {d.sla_hours}h</span>
                          <span>👷 Officer: {d.assigned_officer}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
