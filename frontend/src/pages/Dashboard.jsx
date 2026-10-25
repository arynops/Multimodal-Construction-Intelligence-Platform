import React, { useEffect, useState } from 'react';
import {
  MapPin, Shield, DollarSign, BarChart2, Package, FileText,
  MessageCircle, Camera, TrendingUp, AlertTriangle, Users, Building2,
  Activity, ArrowRight, Zap, Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkHealth, formatINRCompact } from '../api';

const features = [
  { to: '/site-analysis', icon: MapPin, label: 'Site Analysis', desc: 'Multimodal AI site condition analysis', color: '#3b82f6', stat: 'AI-Powered' },
  { to: '/safety-inspection', icon: Shield, label: 'Safety Inspection', desc: 'PPE & compliance detection from images', color: '#10b981', stat: 'IS: 4130' },
  { to: '/cost-estimation', icon: DollarSign, label: 'Cost Estimation', desc: 'Detailed BOQ & cost in INR', color: '#f59e0b', stat: '₹ INR' },
  { to: '/progress-monitoring', icon: BarChart2, label: 'Progress Monitor', desc: 'Schedule & EVM analysis', color: '#8b5cf6', stat: 'EVM' },
  { to: '/material-analysis', icon: Package, label: 'Material Analysis', desc: 'BOQ with market prices', color: '#f97316', stat: 'BOQ' },
  { to: '/project-report', icon: FileText, label: 'Project Report', desc: 'Executive AI project reports', color: '#06b6d4', stat: 'KPIs' },
  { to: '/visual-progress', icon: Camera, label: 'Visual Progress', desc: 'Image-based progress detection', color: '#ec4899', stat: 'Vision AI' },
  { to: '/chat', icon: MessageCircle, label: 'AI Assistant', desc: 'Expert construction Q&A', color: '#a78bfa', stat: 'Chat AI' },
];

const stats = [
  { label: 'Avg Cost Savings', value: '18%', sub: 'Per project vs baseline', color: 'green', icon: TrendingUp },
  { label: 'Safety Score Avg', value: '87/100', sub: 'Across analyzed sites', color: 'blue', icon: Shield },
  { label: 'Projects Analyzed', value: '2,400+', sub: 'Nationwide deployments', color: 'purple', icon: Building2 },
  { label: 'Site Engineers', value: '8,500+', sub: 'Active platform users', color: 'amber', icon: Users },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(r => setHealth(r.data))
      .catch(() => setHealth({ status: 'error', ai_available: false }));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="card mb-xl" style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.8) 0%, rgba(59,130,246,0.4) 50%, rgba(6,182,212,0.3) 100%)',
        border: '1px solid rgba(59,130,246,0.4)',
        padding: 'var(--spacing-2xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative' }}>
          <div className="flex items-center gap-sm mb-md">
            <span className="badge badge-info" style={{ padding: '4px 12px' }}>
              <Zap size={11} />
              AI-Powered Platform
            </span>
            {health?.ai_available && (
              <span className="badge badge-success" style={{ padding: '4px 12px' }}>
                <Activity size={11} />
                Groq Online
              </span>
            )}
          </div>
          <h1 className="page-title" style={{ fontSize: '2.25rem', marginBottom: 12 }}>
            Multimodal Construction<br />
            <span style={{ background: 'linear-gradient(90deg, #93c5fd, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Intelligence Platform
            </span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 560, lineHeight: 1.7, marginBottom: 24 }}>
            AI decision-support for site engineers, contractors, and project managers. 
            Analyze sites, inspect safety, estimate costs, and generate reports — all powered by Groq's Llama-4 Scout.
          </p>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              <MessageCircle size={16} />
              Start AI Chat
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/site-analysis')}>
              <MapPin size={16} />
              Analyze Site
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-xl">
        {stats.map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-icon" style={{
              background: color === 'green' ? 'rgba(16,185,129,0.15)' :
                         color === 'blue' ? 'rgba(59,130,246,0.15)' :
                         color === 'purple' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)',
            }}>
              <Icon size={20} style={{
                color: color === 'green' ? '#10b981' :
                       color === 'blue' ? '#3b82f6' :
                       color === 'purple' ? '#8b5cf6' : '#f59e0b',
              }} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="page-header">
        <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Platform Modules</h2>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Select a module to begin AI-powered construction analysis</p>
      </div>
      <div className="grid-auto">
        {features.map(({ to, icon: Icon, label, desc, color, stat }) => (
          <div
            key={to}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(to)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(to)}
          >
            <div className="flex items-center justify-between mb-md">
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                background: `${color}20`,
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} style={{ color }} />
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{stat}</span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{label}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{desc}</p>
            <div className="flex items-center gap-xs" style={{ color, fontSize: '0.8125rem', fontWeight: 500 }}>
              <span>Open module</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* API Status */}
      {health && (
        <div className="card mt-xl" style={{ padding: 'var(--spacing-md)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <Globe size={16} className="text-secondary" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                System Status: <strong style={{ color: health.status === 'healthy' ? '#10b981' : '#ef4444' }}>
                  {health.status === 'healthy' ? 'All Systems Operational' : 'Degraded'}
                </strong>
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              v{health.version}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
