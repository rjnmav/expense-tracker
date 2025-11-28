import axios from 'axios';

const API_URL = '/api';

// Auth API
export const authAPI = {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
};

// Accounts API
export const accountsAPI = {
  getAll: () => axios.get(`${API_URL}/accounts`),
  getOne: (id) => axios.get(`${API_URL}/accounts/${id}`),
  create: (data) => axios.post(`${API_URL}/accounts`, data),
  update: (id, data) => axios.put(`${API_URL}/accounts/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/accounts/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => axios.get(`${API_URL}/transactions`, { params }),
  getOne: (id) => axios.get(`${API_URL}/transactions/${id}`),
  create: (data) => axios.post(`${API_URL}/transactions`, data),
  update: (id, data) => axios.put(`${API_URL}/transactions/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/transactions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getSummary: (params) => axios.get(`${API_URL}/analytics/summary`, { params }),
  getTrends: (params) => axios.get(`${API_URL}/analytics/trends`, { params }),
  getCategories: (params) => axios.get(`${API_URL}/analytics/categories`, { params }),
  getAccounts: () => axios.get(`${API_URL}/analytics/accounts`),
};
