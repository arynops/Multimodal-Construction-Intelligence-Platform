import React, { useState } from 'react';
import { BarChart2, Calendar, TrendingUp, IndianRupee } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { RecommendationList } from '../components/ResultCards';
import { monitorProgress, formatINR, formatINRCompact } from '../api';
import toast from 'react-hot-toast';

const statusColors = {
  completed: '#10b981',
  in_progress: '#3b82f6',
  delayed: '#ef4444',
  pending: '#475569',
};

export default function ProgressMonitoring() {
  const [form, setForm] = useState({
    project_name: 'Shree Residency Tower A',
    start_date: '2024-03-01',
    planned_end_date: '2025-06-30',
    total_budget_inr: 25000000,
    spent_so_far_inr: 12000000,
    current_phase: 'Structure',
    completed_phases: ['Site Preparation', 'Foundation'],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togglePhase = (phase) => {
    set('completed_phases', form.completed_phases.includes(phase)
      ? form.completed_phases.filter(p => p !== phase)
      : [...form.completed_phases, phase]);
  };

  const phases = ['Site Preparation', 'Foundation', 'Structure', 'MEP', 'Finishing', 'External Works'];

  const handleMonitor = async () => {
    setLoading(true);
    try {
      const res = await monitorProgress({
        ...form,
        total_budget_inr: Number(form.total_budget_inr),
        spent_so_far_inr: Number(form.spent_so_far_inr),
      });
      setResult(res.data);
      toast.success('Progress analysis complete!');
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
    status: p.status,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <BarChart2 size={24} style={{ color: '#8b5cf6' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Progress Monitoring</h1>
        </div>
        <p className="page-subtitle">AI-powered schedule variance analysis, EVM tracking, and phase-by-phase progress evaluation.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Project Information</h3>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-control" value={form.project_name} onChange={e => set('project_name', e.target.value)} id="proj-name-input" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-control" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Planned End Date</label>
              <input className="form-control" type="date" value={form.planned_end_date} onChange={e => set('planned_end_date', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Total Budget (₹)</label>
              <input className="form-control" type="number" value={form.total_budget_inr} onChange={e => set('total_budget_inr', e.target.value)} id="budget-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Spent So Far (₹)</label>
              <input className="form-control" type="number" value={form.spent_so_far_inr} onChange={e => set('spent_so_far_inr', e.target.value)} id="spent-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Current Phase</label>
            <select className="form-control" value={form.current_phase} onChange={e => set('current_phase', e.target.value)} id="phase-select">
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Completed Phases</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {phases.map(p => (
                <button
                  key={p}
                  onClick={() => togglePhase(p)}
                  className={`badge ${form.completed_phases.includes(p) ? 'badge-success' : 'badge-info'}`}
                  style={{ cursor: 'pointer', padding: '6px 12px', border: 'none' }}
                >
                  {form.completed_phases.includes(p) ? '✓ ' : ''}{p}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Issues</label>
            <textarea className="form-control" rows={3} placeholder="Any key issues, delays, or observations..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleMonitor} disabled={loading} id="analyze-progress-btn">
            {loading ? <><div className="spinner spinner-sm" /> Analyzing<span className="loading-dots" /></> : <><BarChart2 size={16} /> Analyze Progress</>}
          </button>
        </div>

        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">AI analyzing project progress<span className="loading-dots" /></p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* KPI Cards */}
              <div className="stat-grid mb-md" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="stat-card blue">
                  <div className="stat-label">Overall Progress</div>
                  <div className="stat-value">{result.overall_progress_percent?.toFixed(0)}%</div>
                  <div style={{ marginTop: 6 }}>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${result.overall_progress_percent}%` }} />
                    </div>
                  </div>
                </div>
                <div className={`stat-card ${result.schedule_variance_days > 0 ? 'red' : 'green'}`}>
                  <div className="stat-label">Schedule Variance</div>
                  <div className="stat-value">{result.schedule_variance_days > 0 ? '+' : ''}{result.schedule_variance_days}</div>
                  <div className="stat-sub">days {result.schedule_variance_days > 0 ? 'delayed' : 'ahead'}</div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-label">Budget Utilized</div>
                  <div className="stat-value" style={{ fontSize: '1.25rem' }}>{formatINRCompact(result.budget_utilized_inr)}</div>
                  <div className="stat-sub">Remaining: {formatINRCompact(result.budget_remaining_inr)}</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Resource Utilization</div>
                  <div className="stat-value">{result.resource_utilization_percent?.toFixed(0)}%</div>
                  <div className="stat-sub">Projected: {result.projected_completion_date}</div>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Phase Progress (Planned vs Actual)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                      <Tooltip contentStyle={{ background: '#0f1e3c', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#f0f6ff' }} />
                      <Legend />
                      <Bar dataKey="Planned" fill="rgba(59,130,246,0.4)" radius={[4,4,0,0]} />
                      <Bar dataKey="Actual" fill="#3b82f6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Phase Table */}
              <div className="card mb-md">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Phase Status</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Phase</th>
                      <th>Status</th>
                      <th>Planned</th>
                      <th>Actual</th>
                      <th>Delay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.phases?.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.phase_name}</td>
                        <td>
                          <span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'in_progress' ? 'info' : p.status === 'delayed' ? 'high' : 'medium'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{p.planned_percent}%</td>
                        <td style={{ color: p.actual_percent >= p.planned_percent ? '#10b981' : '#f59e0b' }}>
                          {p.actual_percent}%
                        </td>
                        <td style={{ color: p.delay_days > 0 ? '#ef4444' : '#10b981' }}>
                          {p.delay_days > 0 ? `+${p.delay_days}d` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.recommendations?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.recommendations} title="AI Recommendations" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <BarChart2 size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No analysis yet</p>
              <p style={{ fontSize: '0.875rem' }}>Fill in project data and analyze progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
