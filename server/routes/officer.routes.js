import { Router } from 'express';
import {
  getOfficerStats,
  getQueue,
  getApplicationDocuments,
  verifyDocument,
  rejectOrRequestReupload,
  getVerificationHistory,
} from '../controllers/officer.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
router.use(protect, authorize('officer'));

router.get('/dashboard/stats', getOfficerStats);
router.get('/queue', getQueue);
router.get('/applications/:id/documents', getApplicationDocuments);
router.put('/documents/:docId/verify', verifyDocument);
router.put('/documents/:docId/reject', rejectOrRequestReupload('Rejected'));
router.put('/documents/:docId/request-reupload', rejectOrRequestReupload('Re-upload Required'));
router.get('/history', getVerificationHistory);

export default router;

