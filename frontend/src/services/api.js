/**
 * SHI - API Service
 * Centralized Axios configuration for API calls
 */

import axios from 'axios';


// Create axios instance with base URL (using Vite proxy)
const api = axios.create({
    baseURL: '/api',  // Vite proxy will forward to http://localhost:5000
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Health check
export const checkHealth = () => api.get('/health');

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Student endpoints
export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);

// Teacher endpoints
export const getTeachers = () => api.get('/teachers');
export const getTeacher = (id) => api.get(`/teachers/${id}`);

// Course endpoints
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);

// Attendance endpoints
export const getAttendance = () => api.get('/attendance');
export const getAttendanceByStudent = (studentId) => api.get(`/attendance/student/${studentId}`);
export const getAttendanceByCourse = (courseId) => api.get(`/attendance/course/${courseId}`);
export const markAttendance = (data) => api.post('/attendance', data);
export const bulkMarkAttendance = (data) => api.post('/attendance/bulk', data);

// Activity endpoints
export const getActivities = () => api.get('/activities');
export const getActivity = (id) => api.get(`/activities/${id}`);
export const createActivity = (data) => api.post('/activities', data);

// Analytics endpoints
export const getOverview = () => api.get('/analytics/overview');
export const getCourseAnalytics = (courseId) => api.get(`/analytics/attendance/${courseId}`);
export const getStudentPerformance = (studentId) => api.get(`/analytics/performance/${studentId}`);

// Notification endpoints
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

export default api;

