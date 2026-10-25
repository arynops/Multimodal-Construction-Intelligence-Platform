import React, { useState } from 'react';
import { FileText, Download, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskCard, RecommendationList } from '../components/ResultCards';
import { generateReport, formatINR, formatINRCompact } from '../api';
import toast from 'react-hot-toast';

const statusColors = {
  'On Track': '#10b981',
  'Delayed': '#ef4444',
  'At Risk': '#f59e0b',
  'Completed': '#3b82f6',
};

export default function ProjectReport() {
  const [form, setForm] = useState({
    project_name: 'Skyline Commercial Complex',
    project_type: 'Commercial',
    location: 'Hyderabad, Telangana',
    start_date: '2024-01-15',
    planned_end_date: '2025-09-30',
    total_budget_inr: 50000000,
    spent_inr: 28000000,
    current_progress_percent: 55,
    current_phase: 'MEP',
    team_size: 120,
    key_issues: 'Steel price escalation, monsoon delays in foundation phase',
    achievements: 'Structure completed ahead of schedule, zero LTI incidents',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateReport({
        ...form,
        total_budget_inr: Number(form.total_budget_inr),
        spent_inr: Number(form.spent_inr),
        current_progress_percent: Number(form.current_progress_percent),
        team_size: Number(form.team_size),
      });
      setResult(res.data);
      toast.success('Report generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const radarData = result?.kpis ? Object.entries(result.kpis).map(([key, val]) => ({
    subject: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    A: parseInt(val) || 0,
    fullMark: 100,
  })) : [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <FileText size={24} style={{ color: '#06b6d4' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Project Report</h1>
        </div>
        <p className="page-subtitle">AI-generated executive project status report with KPIs, financial summary, and risk register.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Report Parameters</h3>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-control" value={form.project_name} onChange={e => set('project_name', e.target.value)} id="report-proj-name" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Project Type</label>
              <select className="form-control" value={form.project_type} onChange={e => set('project_type', e.target.value)} id="report-proj-type">
                {['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Mixed-Use'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
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
              <input className="form-control" type="number" value={form.total_budget_inr} onChange={e => set('total_budget_inr', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Spent Till Date (₹)</label>
              <input className="form-control" type="number" value={form.spent_inr} onChange={e => set('spent_inr', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Progress (%)</label>
              <input className="form-control" type="number" min={0} max={100} value={form.current_progress_percent} onChange={e => set('current_progress_percent', e.target.value)} id="report-progress-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Team Size</label>
              <input className="form-control" type="number" value={form.team_size} onChange={e => set('team_size', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Current Phase</label>
            <select className="form-control" value={form.current_phase} onChange={e => set('current_phase', e.target.value)} id="report-phase-select">
              {['Site Preparation', 'Foundation', 'Structure', 'MEP', 'Finishing', 'External Works'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Key Issues</label>
            <textarea className="form-control" rows={2} value={form.key_issues} onChange={e => set('key_issues', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Achievements</label>
            <textarea className="form-control" rows={2} value={form.achievements} onChange={e => set('achievements', e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleGenerate} disabled={loading} id="generate-report-btn">
            {loading ? <><div className="spinner spinner-sm" /> Generating<span className="loading-dots" /></> : <><FileText size={16} /> Generate Report</>}
          </button>
        </div>

        <div>
          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p className="loading-text">AI generating executive report<span className="loading-dots" /></p>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Header */}
              <div className="card mb-md" style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 100%)',
                borderColor: 'rgba(6,182,212,0.3)',
              }}>
                <div className="flex items-center justify-between mb-sm">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{result.project_name}</h3>
                  <span className="badge" style={{
                    background: `${(statusColors[result.overall_health] || '#3b82f6')}20`,
                    color: statusColors[result.overall_health] || '#93c5fd',
                    border: `1px solid ${(statusColors[result.overall_health] || '#3b82f6')}40`,
                    fontSize: '0.8rem', padding: '4px 12px',
                  }}>
                    {result.overall_health}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {result.executive_summary}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                  Report Date: {result.report_date}
                </p>
              </div>

              {/* KPI Radar */}
              {radarData.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>KPI Performance Radar</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Radar name="KPIs" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      <Tooltip contentStyle={{ background: '#0f1e3c', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Financial Summary */}
              {result.financial_summary && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Financial Summary</h4>
                  <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {[
                      { key: 'total_budget_inr', label: 'Total Budget', color: 'blue' },
                      { key: 'spent_inr', label: 'Spent', color: 'amber' },
                      { key: 'remaining_inr', label: 'Remaining', color: 'green' },
                      { key: 'projected_overrun_inr', label: 'Proj. Overrun', color: 'red' },
                    ].map(({ key, label, color }) => (
                      <div key={key} className={`stat-card ${color}`} style={{ padding: '14px' }}>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value" style={{ fontSize: '1.125rem' }}>
                          {formatINRCompact(result.financial_summary[key] || 0)}
                        </div>
                        <div className="stat-sub">{formatINR(result.financial_summary[key] || 0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {result.milestones?.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Milestones</h4>
                  {result.milestones.map((m, i) => (
                    <div key={i} className="flex gap-sm mb-sm" style={{ alignItems: 'flex-start' }}>
                      <div style={{ marginTop: 2 }}>
                        {m.status === 'completed'
                          ? <CheckCircle size={16} style={{ color: '#10b981' }} />
                          : m.status === 'delayed'
                          ? <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                          : <Clock size={16} style={{ color: '#94a3b8' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{m.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Planned: {m.planned_date} {m.actual_date ? `· Actual: ${m.actual_date}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.risks?.length > 0 && (
                <div className="card mb-md">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Risk Register</h4>
                  {result.risks.map((r, i) => <RiskCard key={i} risk={r} index={i} />)}
                </div>
              )}

              {result.action_items?.length > 0 && (
                <div className="card">
                  <RecommendationList items={result.action_items} title="Action Items" />
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card empty-state">
              <FileText size={52} className="empty-state-icon" />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No report yet</p>
              <p style={{ fontSize: '0.875rem' }}>Fill in project details to generate an executive report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
