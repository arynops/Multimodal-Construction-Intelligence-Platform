import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export function RiskCard({ risk, index }) {
  const severityConfig = {
    low: { cls: 'badge-low', icon: CheckCircle, color: '#10b981' },
    medium: { cls: 'badge-medium', icon: AlertTriangle, color: '#f59e0b' },
    high: { cls: 'badge-high', icon: AlertTriangle, color: '#ef4444' },
    critical: { cls: 'badge-critical', icon: XCircle, color: '#dc2626' },
  };
  const cfg = severityConfig[risk.severity?.toLowerCase()] || severityConfig.medium;
  const Icon = cfg.icon;

  return (
    <div className="card-glass" style={{ marginBottom: 10, borderLeft: `3px solid ${cfg.color}` }}>
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <Icon size={16} style={{ color: cfg.color }} />
          <span className={`badge ${cfg.cls}`}>{risk.severity}</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Risk #{index + 1}</span>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
        {risk.description}
      </p>
      {risk.mitigation && (
        <div className="flex items-center gap-xs" style={{ marginTop: 6 }}>
          <Info size={13} style={{ color: 'var(--color-accent-primary)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{risk.mitigation}</p>
        </div>
      )}
    </div>
  );
}

export function RecommendationList({ items, title = 'Recommendations' }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 10, color: 'var(--color-text-primary)' }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-sm" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: '#93c5fd', flexShrink: 0, marginTop: 2,
            }}>{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TagList({ items, label }) {
  if (!items?.length) return null;
  return (
    <div className="mb-md">
      {label && <p className="form-label">{label}</p>}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => (
          <span key={i} className="badge badge-info" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
