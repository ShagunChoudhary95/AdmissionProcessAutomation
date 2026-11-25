import { Router } from 'express';
import {
  getDashboardStats,
  listApplications,
  getApplicationDetail,
  reviewApplication,
  issueOffer,
  getMeritList,
  getCoursesAdmin,
  createCourse,
  updateCourse,
  getBranchesAdmin,
  createBranch,
  updateBranch,
  getEligibilityRules,
  createEligibilityRule,
  updateEligibilityRule,
  getMeritRules,
  createMeritRule,
  updateMeritRule,
  getSeats,
  updateSeats,
  getReports,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/applications', listApplications);
router.get('/applications/:id', getApplicationDetail);
router.put('/applications/:id/review', reviewApplication);
router.post('/applications/:id/offer', issueOffer);
router.get('/merit-list/:branchId', getMeritList);

router.get('/courses', getCoursesAdmin);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);

router.get('/branches', getBranchesAdmin);
router.post('/branches', createBranch);
router.put('/branches/:id', updateBranch);

router.get('/eligibility-rules', getEligibilityRules);
router.post('/eligibility-rules', createEligibilityRule);
router.put('/eligibility-rules/:id', updateEligibilityRule);

router.get('/merit-rules', getMeritRules);
router.post('/merit-rules', createMeritRule);
router.put('/merit-rules/:id', updateMeritRule);

router.get('/seats', getSeats);
router.put('/seats/:branchId', updateSeats);

router.get('/reports/:type', getReports);

export default router;

