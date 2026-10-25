import React, { useState } from 'react';
import { Camera, Eye, BarChart2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ImageUploader from '../components/ImageUploader';
import ScoreGauge from '../components/ScoreGauge';
import { RecommendationList } from '../components/ResultCards';
import { visualProgress, formatINR, formatINRCompact } from '../api';
import toast from 'react-hot-toast';

export default function VisualProgress() {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('My Construction Project');
  const [budget, setBudget] = useState(10000000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a site image.');
    setLoading(true);
    try {
      const res = await visualProgress(file, projectName, budget);
      setResult(res.data);
      toast.success('Visual progress analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.phases?.map(p => ({
    name: p.phase_name.length > 12 ? p.phase_name.substring(0, 12) + '…' : p.phase_name,
    Planned: p.planned_percent,
    Actual: p.actual_percent,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <Camera size={24} style={{ color: '#ec4899' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Visual Progress Analysis</h1>
        </div>
        <p className="page-subtitle">Upload a site photo — AI estimates construction progress, phase completion, and resource utilization from the image.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card mb-md">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Upload Site Photo</h3>
            <ImageUploader onFileSelect={setFile} label="Drop your site progress photo here" />
          </div>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-control" value={projectName} onChange={e => setProjectName(e.target.value)} id="vp-project-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Total Budget (₹)</label>
              <input className="form-control" type="number" value={budget} onChange={e => setBudget(e.target.value)} id="vp-budget-input" />
            </div>
            <button className="btn btn-primary w-full" onClick={handleAnalyze} disabled={!file || loading} id="analyze-visual-progress-btn">
              {loading ? <><div className="spinner spinner-sm" /> Analyzing Image<span className="loading-dots" /></> : <><Camera size={16} /> Analyze Progress</>}
            </button>
          </div>
        </div>

        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Vision AI analyzing construction progress<span className="loading-dots" /></p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>Using Groq Llama-4 Scout multimodal model</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              <div className="card mb-md">
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                  <ScoreGauge score={result.overall_progress_percent} label="Overall Progress" color="#ec4899" />
                  <div style={{ flex: 1 }}>
                    <div className="stat-grid mb-sm" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div>
                        <p className="stat-label">Schedule Variance</p>
                        <p className="stat-value" style={{ fontSize: '1.25rem', color: result.schedule_variance_days > 0 ? '#ef4444' : '#10b981' }}>
                          {result.schedule_variance_days > 0 ? '+' : ''}{result.schedule_variance_days}d
                        </p>
                      </div>
                      <div>
                        <p className="stat-label">Resources Used</p>
                        <p className="stat-value" style={{ fontSize: '1.25rem' }}>{result.resource_utilization_percent?.toFixed(0)}%</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <Clock size={12} style={{ marginRight: 4 }} />
                      Projected: {result.projected_completion_date}
                    </p>
                  </div>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Phase Completion Analysis</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                      <Tooltip contentStyle={{ background: '#0f1e3c', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 8 }} />
                      <Bar dataKey="Planned" fill="rgba(236,72,153,0.3)" radius={[4,4,0,0]} />
                      <Bar dataKey="Actual" fill="#ec4899" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Budget estimate */}
              {(result.budget_utilized_inr > 0 || result.budget_remaining_inr > 0) && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Budget Estimate from Image</h4>
                  <div className="grid-2">
                    <div className="card-glass">
                      <p className="stat-label">Utilized (est.)</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f59e0b' }}>
                        {formatINRCompact(result.budget_utilized_inr)}
                      </p>
                    </div>
                    <div className="card-glass">
                      <p className="stat-label">Remaining (est.)</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>
                        {formatINRCompact(result.budget_remaining_inr)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.key_observations?.length > 0 && (
                <div className="card mb-md">
                  <RecommendationList items={result.key_observations} title="👁️ Key Visual Observations" />
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
              <Camera size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No visual analysis yet</p>
              <p style={{ fontSize: '0.875rem' }}>Upload a site photo to detect construction progress with AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
