// src/services/api.js
import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Shipments ────────────────────────────────────────────────
export const shipmentsApi = {
  getAll:    (params)     => api.get('/api/shipments', { params }),
  getById:   (id)         => api.get(`/api/shipments/${id}`),
  update:    (id, data)   => api.patch(`/api/shipments/${id}`, data),
}

// ─── Drivers ──────────────────────────────────────────────────
export const driversApi = {
  getAll:    ()           => api.get('/api/drivers'),
  getById:   (id)         => api.get(`/api/drivers/${id}`),
  updateStatus: (id, status) => api.patch(`/api/drivers/${id}/status`, { status }),
}

// ─── Exceptions ───────────────────────────────────────────────
export const exceptionsApi = {
  getAll:    (params)     => api.get('/api/exceptions', { params }),
  getById:   (id)         => api.get(`/api/exceptions/${id}`),
  resolve:   (id)         => api.post(`/api/exceptions/${id}/resolve`),
  create:    (data)       => api.post('/api/exceptions', data),
}

// ─── Orders ───────────────────────────────────────────────────
export const ordersApi = {
  getAll:    (params)     => api.get('/api/orders', { params }),
  getById:   (id)         => api.get(`/api/orders/${id}`),
}

// ─── Inventory ────────────────────────────────────────────────
export const inventoryApi = {
  getAll:    (params)     => api.get('/api/inventory', { params }),
}

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login:     (creds)      => api.post('/api/auth/login', creds),
  logout:    ()           => api.post('/api/auth/logout'),
  me:        ()           => api.get('/api/auth/me'),
}

export default api
