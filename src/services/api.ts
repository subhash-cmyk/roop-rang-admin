import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// token automatically bhejne ke liye
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API

// ================= AUTH =================
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    API.post('/admin/login', data),

  profile: () => API.get('/admin/profile'),
  logout: () => API.post('/admin/logout'),
}

// ================= DASHBOARD =================
export const dashboardAPI = {
  stats: () => API.get('/dashboard'),
}

// ================= CATEGORY =================
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getById: (id: string) => API.get(`/categories/${id}`),

  create: (data: FormData) =>
    API.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    API.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => API.delete(`/categories/${id}`),
}

// ================= PRODUCTS =================
export const productAPI = {
  getAll: () => API.get('/products'),
  getById: (id: string) => API.get(`/products/${id}`),

  create: (data: FormData) =>
    API.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    API.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => API.delete(`/products/${id}`),
}

// ================= OFFERS =================
export const offerAPI = {
  getAll: () => API.get('/offers'),
  getById: (id: string) => API.get(`/offers/${id}`),

  create: (data: FormData) =>
    API.post('/offers', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    API.put(`/offers/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => API.delete(`/offers/${id}`),
}

// ================= USERS =================
export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id: string) => API.get(`/users/${id}`),
  update: (id: string, data: any) => API.put(`/users/${id}`, data),
  delete: (id: string) => API.delete(`/users/${id}`),
}

// ================= CONTACT =================
export const contactAPI = {
  getAll: () => API.get('/contact'),
  getById: (id: string) => API.get(`/contact/${id}`),
  reply: (id: string, data: any) => API.post(`/contact/${id}/reply`, data),
  delete: (id: string) => API.delete(`/contact/${id}`),
}

// ================= INQUIRY =================
export const inquiryAPI = {
  getAll: () => API.get('/inquiry'),
  getById: (id: string) => API.get(`/inquiry/${id}`),
  reply: (id: string, data: any) => API.put(`/inquiry/${id}`, data),
  delete: (id: string) => API.delete(`/inquiry/${id}`),
}

// ================= PRIVACY =================
export const privacyAPI = {
  get: () => API.get('/privacy-policy'),
  getAll: () => API.get('/privacy-policy/all'),
  create: (data: any) => API.post('/privacy-policy', data),
  update: (id: number | string, data: any) =>
    API.put(`/privacy-policy/${id}`, data),
  delete: (id: number | string) =>
    API.delete(`/privacy-policy/${id}`),
}
// ================= TERMS =================
export const termsAPI = {
  get: () => API.get('/terms'),
  getAll: () => API.get('/terms/all'),
  create: (data: any) => API.post('/terms', data),
  update: (id: number | string, data: any) => API.put(`/terms/${id}`, data),
  delete: (id: number | string) => API.delete(`/terms/${id}`),
}

// ================= SETTINGS =================
export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data: any) => API.put('/settings', data),
}

// ================= HERO =================

export const heroAPI = {
  get: () => API.get("/hero"),

  update: (data: any) =>
    API.put("/hero", data),
}
export const getImageUrl = (image?: string) => {

  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  const baseURL = API.defaults.baseURL?.replace("/api","");

  return `${baseURL}${image}`;

};

// ================= UPLOAD =================
export const uploadAPI = {
  uploadSingle: (formData: FormData) =>
    API.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadMultiple: (formData: FormData) =>
    API.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    hero: (formData: FormData) =>
    API.post('/upload/hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    
}