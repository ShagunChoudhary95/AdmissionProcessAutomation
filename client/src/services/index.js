import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const studentService = {
  getProfile: () => api.get('/student/profile'),
  updatePersonal: (data) => api.put('/student/profile/personal', data),
  updateAcademic: (data) => api.put('/student/profile/academic', data),
};

export const applicationService = {
  create: () => api.post('/applications'),
  getMy: () => api.get('/applications/my'),
  updateCourse: (id, data) => api.put(`/applications/${id}/course`, data),
  checkEligibility: (id) => api.get(`/applications/${id}/eligibility`),
  submit: (id) => api.post(`/applications/${id}/submit`),
  submitCorrection: (id, data) => api.put(`/applications/${id}/correction`, data),
  getStatus: (id) => api.get(`/applications/${id}/status`),
};

export const documentService = {
  list: (applicationId) => api.get(`/documents/${applicationId}`),
  upload: (applicationId, formData) =>
    api.post(`/documents/${applicationId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reupload: (applicationId, docId, formData) =>
    api.post(`/documents/${applicationId}/${docId}/reupload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getFile: (applicationId, docId) =>
    api.get(`/documents/${applicationId}/${docId}/file`, { responseType: 'blob' }),
};

export const paymentService = {
  createOrder: (applicationId) => api.post('/payments/create-order', { applicationId }),
  verify: (data) => api.post('/payments/verify', data),
  getReceipt: (applicationId) =>
    api.get(`/payments/${applicationId}/receipt`, { responseType: 'blob' }),
};

export const courseService = {
  list: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard/stats'),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getApplication: (id) => api.get(`/admin/applications/${id}`),
  reviewApplication: (id, data) => api.put(`/admin/applications/${id}/review`, data),
  issueOffer: (id, data) => api.post(`/admin/applications/${id}/offer`, data),
  getMeritList: (branchId) => api.get(`/admin/merit-list/${branchId}`),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  getBranches: (params) => api.get('/admin/branches', { params }),
  createBranch: (data) => api.post('/admin/branches', data),
  updateBranch: (id, data) => api.put(`/admin/branches/${id}`, data),
  getEligibilityRules: () => api.get('/admin/eligibility-rules'),
  createEligibilityRule: (data) => api.post('/admin/eligibility-rules', data),
  updateEligibilityRule: (id, data) => api.put(`/admin/eligibility-rules/${id}`, data),
  getMeritRules: () => api.get('/admin/merit-rules'),
  createMeritRule: (data) => api.post('/admin/merit-rules', data),
  updateMeritRule: (id, data) => api.put(`/admin/merit-rules/${id}`, data),
  getSeats: () => api.get('/admin/seats'),
  updateSeats: (branchId, data) => api.put(`/admin/seats/${branchId}`, data),
  getReports: (type, params) => api.get(`/admin/reports/${type}`, { params }),
};

export const officerService = {
  getDashboard: () => api.get('/officer/dashboard/stats'),
  getQueue: (params) => api.get('/officer/queue', { params }),
  getDocuments: (applicationId) =>
    api.get(`/officer/applications/${applicationId}/documents`),
  verifyDoc: (docId, data) => api.put(`/officer/documents/${docId}/verify`, data),
  rejectDoc: (docId, data) => api.put(`/officer/documents/${docId}/reject`, data),
  requestReupload: (docId, data) =>
    api.put(`/officer/documents/${docId}/request-reupload`, data),
  getHistory: (params) => api.get('/officer/history', { params }),
};

export const notificationService = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

