import React, { useState } from 'react';
import { Package, ShoppingCart, TrendingDown, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RecommendationList } from '../components/ResultCards';
import { analyzeMaterials, formatINR, formatINRCompact } from '../api';
import toast from 'react-hot-toast';

export default function MaterialAnalysis() {
  const [form, setForm] = useState({
    project_type: 'Residential',
    built_up_area_sqft: 1500,
    location: 'Bengaluru, Karnataka',
    quality_grade: 'Standard',
    construction_type: 'RCC Frame Structure',
    special_materials: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await analyzeMaterials({ ...form, built_up_area_sqft: Number(form.built_up_area_sqft) });
      setResult(res.data);
      toast.success('Material analysis ready!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.materials?.slice(0, 8).map(m => ({
    name: m.name.length > 14 ? m.name.substring(0, 14) + '…' : m.name,
    cost: m.total_cost_inr,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <Package size={24} style={{ color: '#f97316' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Material Analysis</h1>
        </div>
        <p className="page-subtitle">AI-generated Bill of Quantities (BOQ) with current Indian market prices in ₹ INR.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Project Parameters</h3>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select className="form-control" value={form.project_type} onChange={e => set('project_type', e.target.value)} id="mat-project-type">
              {['Residential', 'Commercial', 'Industrial', 'Institutional'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Built-up Area (sq.ft)</label>
            <input className="form-control" type="number" value={form.built_up_area_sqft} onChange={e => set('built_up_area_sqft', e.target.value)} id="mat-area-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-control" placeholder="e.g., Bengaluru, Karnataka" value={form.location} onChange={e => set('location', e.target.value)} id="mat-location-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Construction Type</label>
            <select className="form-control" value={form.construction_type} onChange={e => set('construction_type', e.target.value)} id="mat-construction-type">
              {['RCC Frame Structure', 'Load Bearing Structure', 'Steel Frame', 'Prefabricated', 'Green Building'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quality Grade</label>
            <select className="form-control" value={form.quality_grade} onChange={e => set('quality_grade', e.target.value)} id="mat-quality-grade">
              {['Economy', 'Standard', 'Premium', 'Luxury'].map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Special Materials (Optional)</label>
            <textarea className="form-control" rows={2} placeholder="e.g., AAC blocks, fly ash bricks, UPVC windows..." value={form.special_materials} onChange={e => set('special_materials', e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAnalyze} disabled={loading} id="analyze-material-btn">
            {loading ? <><div className="spinner spinner-sm" /> Analyzing<span className="loading-dots" /></> : <><Package size={16} /> Generate BOQ</>}
          </button>
        </div>

        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Generating Bill of Quantities<span className="loading-dots" /></p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>Fetching current market rates for {form.location}</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Summary */}
              <div className="stat-grid mb-md" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="stat-card amber">
                  <div className="stat-label">Total Material Cost</div>
                  <div className="stat-value" style={{ fontSize: '1.25rem' }}>{formatINRCompact(result.total_material_cost_inr)}</div>
                  <div className="stat-sub">{formatINR(result.total_material_cost_inr)}</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Wastage Factor</div>
                  <div className="stat-value">{result.wastage_factor_percent}%</div>
                  <div className="stat-sub">included in estimate</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Materials Listed</div>
                  <div className="stat-value">{result.materials?.length || 0}</div>
                  <div className="stat-sub">line items in BOQ</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Procurement Timeline</div>
                  <div className="stat-value">{result.procurement_timeline_days}</div>
                  <div className="stat-sub">days estimated</div>
                </div>
              </div>

              {/* Bar Chart */}
              {chartData.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Top Materials by Cost</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => formatINRCompact(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                      <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0f1e3c', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8 }} />
                      <Bar dataKey="cost" fill="#f97316" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Materials Table */}
              <div className="card mb-md">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Bill of Quantities</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Grade</th>
                        <th>Rate (₹)</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.materials?.map((m, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{m.name}</td>
                          <td>{m.quantity_required}</td>
                          <td>{m.unit}</td>
                          <td>
                            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{m.quality_grade}</span>
                          </td>
                          <td>{formatINR(m.unit_cost_inr)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>
                            {formatINR(m.total_cost_inr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {result.cost_optimization_tips?.length > 0 && (
                <div className="card mb-md">
                  <RecommendationList items={result.cost_optimization_tips} title="💡 Cost Optimization Tips" />
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.recommendations} title="Procurement Recommendations" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <Package size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No BOQ yet</p>
              <p style={{ fontSize: '0.875rem' }}>Fill in parameters and generate your Bill of Quantities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
