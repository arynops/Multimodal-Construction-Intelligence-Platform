import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Shield, DollarSign,
  BarChart2, Package, FileText, MessageCircle,
  HardHat, Camera, Zap,
} from 'lucide-react';

const navItems = [
  { section: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageCircle, label: 'AI Assistant' },
  ]},
  { section: 'Analysis', items: [
    { to: '/site-analysis', icon: MapPin, label: 'Site Analysis' },
    { to: '/safety-inspection', icon: Shield, label: 'Safety Inspection' },
    { to: '/visual-progress', icon: Camera, label: 'Visual Progress' },
  ]},
  { section: 'Planning', items: [
    { to: '/cost-estimation', icon: DollarSign, label: 'Cost Estimation' },
    { to: '/material-analysis', icon: Package, label: 'Material Analysis' },
  ]},
  { section: 'Monitoring', items: [
    { to: '/progress-monitoring', icon: BarChart2, label: 'Progress Monitor' },
    { to: '/project-report', icon: FileText, label: 'Project Report' },
  ]},
];

export default function Sidebar({ aiOnline }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">
            <HardHat size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">ConstructAI</div>
            <div className="sidebar-logo-sub">Intelligence Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} className="nav-item-icon" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* AI Status */}
      <div className="sidebar-bottom">
        <div className="ai-status">
          <div className={`status-dot ${aiOnline ? '' : 'offline'}`} />
          <span>AI Engine: {aiOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={11} />
          Powered by Groq Llama-4 Scout
        </div>
      </div>
    </aside>
  );
}
