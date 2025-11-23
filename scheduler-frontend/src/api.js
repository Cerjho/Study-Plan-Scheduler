import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        return Promise.reject(new Error(errorMessage));
    }
);

// Authentication endpoints
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/register', data);
export const initiatePasswordReset = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// User endpoints
export const getCurrentUser = () => api.get('/user/me');
export const updateUser = (data) => api.patch('/user/me', data);

// Schedule endpoints
export const getSchedulesByUser = (userId, start, end) =>
    api.get(`/schedules/user/${userId}`, { params: { start, end } });
export const generateStudyPlan = (userId, start, end) =>
    api.post('/schedules/generate', null, { params: { userId, start, end } });
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);

// Course endpoints
export const getCoursesByUser = (userId) => api.get(`/courses/user/${userId}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const getCourse = (id) => api.get(`/courses/${id}`);
export const getCourseByExternalId = (externalId, userId) => api.get(`/courses/external/${externalId}/user/${userId}`);

// Goal endpoints
export const getGoalsByUser = (userId) => api.get(`/goals/user/${userId}`);
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

// Task endpoints
export const getTasksByUser = (userId) => api.get(`/tasks/user/${userId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getTasksByUserAndStatus = (userId, status) => api.get(`/tasks/user/${userId}/status/${status}`);
export const updateTaskProgress = (taskId, data) => api.patch(`/tasks/${taskId}/progress`, data);

// Study time preference endpoints
export const getStudyPreferences = () => api.get(`/study-preferences`);
export const createStudyPreference = (data) => api.post('/study-preferences', data);
export const updateStudyPreference = (id, data) => api.put(`/study-preferences/${id}`, data);
export const deleteStudyPreference = (id) => api.delete(`/study-preferences/${id}`);

// Unavailability endpoints
export const getUnavailabilitiesByUser = (userId) => api.get(`/unavailabilities/user/${userId}`);
export const createUnavailability = (data) => api.post('/unavailabilities', data);
export const updateUnavailability = (id, data) => api.put(`/unavailabilities/${id}`, data);
export const deleteUnavailability = (id) => api.delete(`/unavailabilities/${id}`);

// Google API endpoints
export const getSyncStatus = () => api.get('/google/sync-status');