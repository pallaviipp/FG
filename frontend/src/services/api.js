import axios from 'axios';

// Backend URL without /api since we're not using global prefix
const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💥 Backend server is not running!');
    }
    
    if (error.response?.status === 404) {
      console.error('🔍 Endpoint not found - check backend routes');
    }
    
    if (error.response?.status === 500) {
      console.error('💣 Server error - check backend logs');
    }
    
    return Promise.reject(error);
  }
);

export const clientsAPI = {
  getAll: () => api.get('/clients'),
  create: (clientData) => api.post('/clients', clientData),
  getById: (id) => api.get(`/clients/${id}`),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
  getStatement: (id) => api.get(`/clients/${id}/statement`),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  create: (transactionData) => api.post('/transactions', transactionData),
  getByClient: (clientId) => api.get(`/transactions/client/${clientId}`),
  getUnbilled: () => api.get('/transactions/unbilled'),
};

export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  create: (invoiceData) => api.post('/invoices', invoiceData),
  getById: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  exportExcel: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.clientId) params.append('clientId', filters.clientId);
    
    return api.get(`/invoices/export/excel?${params.toString()}`, {
      responseType: 'blob',
    });
  },
};