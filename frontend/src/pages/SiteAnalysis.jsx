import React, { useState } from 'react';
import { MapPin, Eye, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ScoreGauge from '../components/ScoreGauge';
import { RiskCard, RecommendationList, TagList } from '../components/ResultCards';
import { analyzeSite } from '../api';
import toast from 'react-hot-toast';

export default function SiteAnalysis() {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a site image first.');
    setLoading(true);
    try {
      const res = await analyzeSite(file, context);
      setResult(res.data);
      toast.success('Site analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <MapPin size={24} style={{ color: '#3b82f6' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Site Analysis</h1>
        </div>
        <p className="page-subtitle">Upload a construction site image for AI-powered condition assessment, risk identification, and actionable recommendations.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Input Panel */}
        <div>
          <div className="card mb-md">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Upload Site Image</h3>
            <ImageUploader onFileSelect={setFile} label="Drop your site image here" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Additional Context</h3>
            <div className="form-group">
              <label className="form-label">Site Description / Notes (Optional)</label>
              <textarea
                className="form-control chat-input"
                rows={4}
                placeholder="e.g., 5-storey RCC building under construction in Mumbai. Currently at plinth level. 50 workers on site..."
                value={context}
                onChange={e => setContext(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={handleAnalyze}
              disabled={!file || loading}
              id="analyze-site-btn"
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" />
                  Analyzing with AI<span className="loading-dots" />
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Analyze Site
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">AI is analyzing your site image<br /><span className="loading-dots" /></p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>Using Groq Llama-4 Scout multimodal model</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Score + Summary */}
              <div className="card mb-md">
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                  <ScoreGauge score={result.infrastructure_readiness_score} label="Readiness Score" />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="flex items-center gap-sm mb-sm">
                      <span className={`badge ${
                        result.risk_level === 'low' ? 'badge-low' :
                        result.risk_level === 'high' ? 'badge-high' :
                        result.risk_level === 'critical' ? 'badge-critical' : 'badge-medium'
                      }`}>
                        {result.risk_level} risk
                      </span>
                      <span className="badge badge-info">{result.site_condition}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Elements */}
              <div className="card mb-md">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>
                  <Eye size={14} style={{ marginRight: 6, color: '#3b82f6' }} />
                  Detected Elements
                </h4>
                <TagList items={result.detected_elements} />

                {result.safety_concerns?.length > 0 && (
                  <>
                    <div className="divider" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>
                      <AlertTriangle size={14} style={{ marginRight: 6, color: '#f59e0b' }} />
                      Safety Concerns
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.safety_concerns.map((c, i) => (
                        <li key={i} className="flex gap-sm" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                          <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 3 }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Risks */}
              {result.risks?.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Risk Register</h4>
                  {result.risks.map((r, i) => <RiskCard key={i} risk={r} index={i} />)}
                </div>
              )}

              {/* Recommendations */}
              {result.recommended_actions?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.recommended_actions} title="Recommended Actions" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <MapPin size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No analysis yet</p>
              <p style={{ fontSize: '0.875rem' }}>Upload a site image and click "Analyze Site" to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
