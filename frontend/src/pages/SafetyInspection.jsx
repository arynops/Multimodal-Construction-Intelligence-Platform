import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ScoreGauge from '../components/ScoreGauge';
import { RiskCard, RecommendationList } from '../components/ResultCards';
import { inspectSafety, formatINR } from '../api';
import toast from 'react-hot-toast';

const ppeIcons = {
  helmet: '⛑️',
  safety_vest: '🦺',
  gloves: '🧤',
  safety_boots: '👢',
};

export default function SafetyInspection() {
  const [file, setFile] = useState(null);
  const [siteType, setSiteType] = useState('construction');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInspect = async () => {
    if (!file) return toast.error('Please upload a site image.');
    setLoading(true);
    try {
      const res = await inspectSafety(file, siteType);
      setResult(res.data);
      toast.success('Safety inspection complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Inspection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <Shield size={24} style={{ color: '#10b981' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Safety Inspection</h1>
        </div>
        <p className="page-subtitle">AI-powered PPE detection, hazard identification, and regulatory compliance check per IS 4130 & BOCW Act.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card mb-md">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Upload Site Image</h3>
            <ImageUploader onFileSelect={setFile} label="Drop inspection image here" />
          </div>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Site Type</label>
              <select className="form-control" value={siteType} onChange={e => setSiteType(e.target.value)} id="site-type-select">
                <option value="construction">General Construction</option>
                <option value="excavation">Excavation / Foundation</option>
                <option value="highrise">High-rise Building</option>
                <option value="demolition">Demolition</option>
                <option value="road">Road / Infrastructure</option>
                <option value="tunneling">Tunneling / Underground</option>
              </select>
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={handleInspect}
              disabled={!file || loading}
              id="inspect-safety-btn"
            >
              {loading ? <><div className="spinner spinner-sm" /> Inspecting<span className="loading-dots" /></> : <><Shield size={16} /> Run Safety Inspection</>}
            </button>
          </div>
        </div>

        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">AI safety inspector analyzing image<span className="loading-dots" /></p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Score + Status */}
              <div className="card mb-md">
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                  <ScoreGauge score={result.overall_safety_score} label="Safety Score" />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div className="mb-sm">
                      <span className={`badge ${
                        result.overall_safety_score >= 80 ? 'badge-success' :
                        result.overall_safety_score >= 60 ? 'badge-warning' : 'badge-high'
                      }`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                        {result.compliance_status}
                      </span>
                    </div>
                    {result.estimated_penalty_inr > 0 && (
                      <div className="flex items-center gap-xs" style={{ marginTop: 8 }}>
                        <IndianRupee size={14} style={{ color: '#ef4444' }} />
                        <span style={{ fontSize: '0.875rem', color: '#f87171' }}>
                          Estimated Penalty: <strong>{formatINR(result.estimated_penalty_inr)}</strong>
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                      Next inspection: {result.next_inspection_date}
                    </p>
                  </div>
                </div>
              </div>

              {/* PPE Compliance */}
              <div className="card mb-md">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>PPE Compliance Status</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {Object.entries(result.ppe_compliance || {}).map(([key, compliant]) => (
                    <div key={key} className="card-glass flex items-center gap-sm" style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{ppeIcons[key] || '🔒'}</span>
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: compliant ? '#10b981' : '#ef4444' }}>
                          {compliant ? '✓ Compliant' : '✗ Non-compliant'}
                        </p>
                      </div>
                      {compliant
                        ? <CheckCircle size={16} style={{ marginLeft: 'auto', color: '#10b981' }} />
                        : <XCircle size={16} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Violations */}
              {result.violations?.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>
                    <AlertTriangle size={14} style={{ marginRight: 6, color: '#f59e0b' }} />
                    Violations ({result.violations.length})
                  </h4>
                  {result.violations.map((v, i) => (
                    <div key={i} className="card-glass mb-sm" style={{
                      borderLeft: `3px solid ${v.severity === 'high' || v.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                    }}>
                      <div className="flex items-center justify-between mb-xs">
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {v.violation_type}
                        </span>
                        <span className={`badge badge-${v.severity}`}>{v.severity}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                        📍 {v.location_in_image}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#93c5fd', marginBottom: 4 }}>
                        🔧 {v.corrective_action}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Ref: {v.regulatory_reference}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Immediate Actions */}
              {result.immediate_actions_required?.length > 0 && (
                <div className="card mb-md" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: '#f87171' }}>
                    🚨 Immediate Actions Required
                  </h4>
                  <RecommendationList items={result.immediate_actions_required} title="" />
                </div>
              )}

              {result.recommendations?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.recommendations} title="Recommendations" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <Shield size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No inspection yet</p>
              <p style={{ fontSize: '0.875rem' }}>Upload a site image to run AI safety inspection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
