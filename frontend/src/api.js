import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for AI responses
});

// Format INR currency
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatINRCompact = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

// Health check
export const checkHealth = () => api.get('/health');

// Site Analysis
export const analyzeSite = (imageFile, context = '') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('context', context);
  return api.post('/site-analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Cost Estimation
export const estimateCost = (data) => api.post('/cost-estimation', data);

// Safety Inspection
export const inspectSafety = (imageFile, siteType = 'construction') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('site_type', siteType);
  return api.post('/safety-inspection', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Progress Monitoring
export const monitorProgress = (data) => api.post('/progress-monitoring', data);

// Visual Progress (image-based)
export const visualProgress = (imageFile, projectName, budget) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('project_name', projectName);
  formData.append('total_budget_inr', budget);
  return api.post('/visual-progress', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Material Analysis
export const analyzeMaterials = (data) => api.post('/material-analysis', data);

// Project Report
export const generateReport = (data) => api.post('/project-report', data);

// Chat
export const sendChatMessage = (message, context = '') =>
  api.post('/chat', { message, context });

export default api;
