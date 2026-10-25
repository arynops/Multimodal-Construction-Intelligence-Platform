import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { RiskCard, RecommendationList } from '../components/ResultCards';
import { estimateCost, formatINR, formatINRCompact } from '../api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="card" style={{ padding: '10px 14px', minWidth: 160 }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.8rem' }}>{payload[0].name}</p>
        <p style={{ color: '#93c5fd', fontSize: '0.875rem' }}>{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function CostEstimation() {
  const [form, setForm] = useState({
    project_type: 'Residential',
    location: 'Mumbai, Maharashtra',
    built_up_area_sqft: 1500,
    floors: 2,
    quality_standard: 'Standard',
    special_requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleEstimate = async () => {
    if (!form.built_up_area_sqft || form.built_up_area_sqft < 1) {
      return toast.error('Please enter a valid built-up area.');
    }
    setLoading(true);
    try {
      const res = await estimateCost({ ...form, built_up_area_sqft: Number(form.built_up_area_sqft), floors: Number(form.floors) });
      setResult(res.data);
      toast.success('Cost estimation ready!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Estimation failed.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = result?.cost_breakdown?.map(item => ({
    name: item.label,
    value: item.amount_inr,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <DollarSign size={24} style={{ color: '#f59e0b' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Cost Estimation</h1>
        </div>
        <p className="page-subtitle">AI-generated detailed cost estimation with BOQ breakdown in Indian Rupees (₹).</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Project Details</h3>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select className="form-control" value={form.project_type} onChange={e => set('project_type', e.target.value)} id="project-type-select">
              {['Residential', 'Commercial', 'Industrial', 'Institutional', 'Mixed-Use', 'Infrastructure'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-control" placeholder="e.g., Mumbai, Maharashtra" value={form.location} onChange={e => set('location', e.target.value)} id="location-input" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Built-up Area (sq.ft)</label>
              <input className="form-control" type="number" min={100} value={form.built_up_area_sqft} onChange={e => set('built_up_area_sqft', e.target.value)} id="area-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Number of Floors</label>
              <input className="form-control" type="number" min={1} max={50} value={form.floors} onChange={e => set('floors', e.target.value)} id="floors-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Quality Standard</label>
            <select className="form-control" value={form.quality_standard} onChange={e => set('quality_standard', e.target.value)} id="quality-select">
              {['Economy', 'Standard', 'Premium', 'Luxury'].map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Special Requirements (Optional)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g., Earthquake resistant design, rainwater harvesting, solar panels..."
              value={form.special_requirements}
              onChange={e => set('special_requirements', e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-full" onClick={handleEstimate} disabled={loading} id="estimate-cost-btn">
            {loading ? <><div className="spinner spinner-sm" /> Estimating<span className="loading-dots" /></> : <><TrendingUp size={16} /> Generate Estimate</>}
          </button>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Calculating project costs<span className="loading-dots" /></p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>Analyzing market rates for {form.location}</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Summary Cards */}
              <div className="stat-grid mb-md" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="stat-card blue">
                  <div className="stat-label">Total Estimated Cost</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }} >{formatINRCompact(result.total_estimated_cost_inr)}</div>
                  <div className="stat-sub">{formatINR(result.total_estimated_cost_inr)}</div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-label">Rate per Sq.ft</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatINR(result.cost_per_sqft_inr)}</div>
                  <div className="stat-sub">per sq.ft</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Timeline</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{result.timeline_months}</div>
                  <div className="stat-sub">months estimated</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{result.confidence_score}%</div>
                  <div className="stat-sub">AI confidence</div>
                </div>
              </div>

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Cost Breakdown</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.cost_breakdown.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <div className="flex items-center gap-sm">
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                              {item.label}
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {formatINR(item.amount_inr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Risks & Recs */}
              {result.risks?.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Financial Risks</h4>
                  {result.risks.map((r, i) => <RiskCard key={i} risk={r} index={i} />)}
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.recommendations} title="Cost Optimization Recommendations" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <DollarSign size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No estimate yet</p>
              <p style={{ fontSize: '0.875rem' }}>Fill in the project details and click "Generate Estimate"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
