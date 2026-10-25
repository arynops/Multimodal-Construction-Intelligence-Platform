import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SiteAnalysis from './pages/SiteAnalysis';
import SafetyInspection from './pages/SafetyInspection';
import CostEstimation from './pages/CostEstimation';
import ProgressMonitoring from './pages/ProgressMonitoring';
import MaterialAnalysis from './pages/MaterialAnalysis';
import ProjectReport from './pages/ProjectReport';
import AIChat from './pages/AIChat';
import VisualProgress from './pages/VisualProgress';
import { checkHealth } from './api';

export default function App() {
  const [aiOnline, setAiOnline] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(r => setAiOnline(r.data?.ai_available === true))
      .catch(() => setAiOnline(false));
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar aiOnline={aiOnline} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/site-analysis" element={<SiteAnalysis />} />
            <Route path="/safety-inspection" element={<SafetyInspection />} />
            <Route path="/cost-estimation" element={<CostEstimation />} />
            <Route path="/progress-monitoring" element={<ProgressMonitoring />} />
            <Route path="/material-analysis" element={<MaterialAnalysis />} />
            <Route path="/project-report" element={<ProjectReport />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/visual-progress" element={<VisualProgress />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1e3c',
            color: '#f0f6ff',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  );
}
