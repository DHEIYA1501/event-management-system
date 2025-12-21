import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests automatically
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

// Day 3 API Services
export const adminService = {
  // Profile Management
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getProfile: () => api.get('/users/profile'),
  
  // Event Management (Admin only)
  getAdminEvents: () => api.get('/events/admin/dashboard'),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  
  // Registration Management
  getEventRegistrations: (eventId) => api.get(`/events/${eventId}/registrations`),
  exportRegistrationsCSV: (eventId) => api.get(`/events/${eventId}/registrations/export`, {
    responseType: 'blob' // Important for file download
  }),
  updateRegistrationStatus: (eventId, registrationId, status) => 
    api.put(`/events/${eventId}/registrations/${registrationId}`, { status })
};

// Export for use in components
export default adminService;