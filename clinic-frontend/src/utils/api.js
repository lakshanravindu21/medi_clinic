import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Doctor API
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getOne: (id) => api.get(`/doctors/${id}`),
  
  // ✅ Updated create method to handle FormData
  create: (data) => {
    // If data is FormData, create a new axios instance without Content-Type
    // This allows the browser to set the proper multipart/form-data boundary
    if (data instanceof FormData) {
      return axios({
        method: 'post',
        url: `${API_URL}/doctors`,
        data: data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(response => response.data);
    }
    // Otherwise use normal api instance
    return api.post('/doctors', data);
  },
  
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  
  // ✅ Keep uploadImage for base64 fallback (optional)
  uploadImage: (data) => api.post('/doctors/upload-image', data)
};

// Patient API
export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};

// Appointment API
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`)
};

export default api;