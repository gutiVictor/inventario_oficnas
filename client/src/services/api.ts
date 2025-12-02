import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use((config) => {
    // Add auth token here if implementing authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// API Services
export const assetsAPI = {
    getAll: (params?: Record<string, any>) => api.get('/assets', { params }),
    getById: (id: number) => api.get(`/assets/${id}`),
    create: (data: any) => api.post('/assets', data),
    update: (id: number, data: any) => api.put(`/assets/${id}`, data),
    delete: (id: number) => api.delete(`/assets/${id}`),
};

export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id: number) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
};

export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id: number) => api.get(`/categories/${id}`),
    create: (data: any) => api.post('/categories', data),
    update: (id: number, data: any) => api.put(`/categories/${id}`, data),
    delete: (id: number) => api.delete(`/categories/${id}`),
};

export const locationsAPI = {
    getAll: () => api.get('/locations'),
    getById: (id: number) => api.get(`/locations/${id}`),
    create: (data: any) => api.post('/locations', data),
    update: (id: number, data: any) => api.put(`/locations/${id}`, data),
    delete: (id: number) => api.delete(`/locations/${id}`),
};

export const suppliersAPI = {
    getAll: () => api.get('/suppliers'),
    getById: (id: number) => api.get(`/suppliers/${id}`),
    create: (data: any) => api.post('/suppliers', data),
    update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
    delete: (id: number) => api.delete(`/suppliers/${id}`),
};

export const assignmentsAPI = {
    getAll: () => api.get('/asset-assignments'),
    getById: (id: number) => api.get(`/asset-assignments/${id}`),
    create: (data: any) => api.post('/asset-assignments', data),
    update: (id: number, data: any) => api.put(`/asset-assignments/${id}`, data),
    delete: (id: number) => api.delete(`/asset-assignments/${id}`),
};

export const maintenanceAPI = {
    getAll: () => api.get('/maintenance-orders'),
    getById: (id: number) => api.get(`/maintenance-orders/${id}`),
    create: (data: any) => api.post('/maintenance-orders', data),
    update: (id: number, data: any) => api.put(`/maintenance-orders/${id}`, data),
    delete: (id: number) => api.delete(`/maintenance-orders/${id}`),
};

export const movesAPI = {
    getAll: () => api.get('/asset-moves'),
    getById: (id: number) => api.get(`/asset-moves/${id}`),
    create: (data: any) => api.post('/asset-moves', data),
    update: (id: number, data: any) => api.put(`/asset-moves/${id}`, data),
    delete: (id: number) => api.delete(`/asset-moves/${id}`),
};

export const auditAPI = {
    getAll: (params?: Record<string, any>) => api.get('/audit-logs', { params }),
    getById: (id: number) => api.get(`/audit-logs/${id}`),
};

export const dashboardAPI = {
    getSummary: () => api.get('/dashboard/summary'),
    getStatusDistribution: () => api.get('/dashboard/status-distribution'),
    getCountByCategory: () => api.get('/dashboard/count-by-category'),
    getMaintenanceCosts: () => api.get('/dashboard/maintenance-costs'),
    getAssetsByLocation: () => api.get('/dashboard/assets-by-location'),
    getAssetValueTrends: () => api.get('/dashboard/asset-value-trends'),
    getTopSuppliers: () => api.get('/dashboard/top-suppliers'),
    getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

export default api;
