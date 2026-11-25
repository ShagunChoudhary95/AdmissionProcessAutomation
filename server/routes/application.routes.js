import { Router } from 'express';
import {
  createOrGetDraft,
  getMyApplication,
  updateCourse,
  checkEligibility,
  submitApplication,
  submitCorrection,
  getApplicationStatus,
} from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
router.use(protect, authorize('student'));

router.post('/', createOrGetDraft);
router.get('/my', getMyApplication);
router.put('/:id/course', updateCourse);
router.get('/:id/eligibility', checkEligibility);
router.post('/:id/submit', submitApplication);
router.put('/:id/correction', submitCorrection);
router.get('/:id/status', getApplicationStatus);

export default router;

