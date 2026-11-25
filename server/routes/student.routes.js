import { Router } from 'express';
import { getProfile, updatePersonal, updateAcademic } from '../controllers/student.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
router.use(protect, authorize('student'));

router.get('/profile', getProfile);
router.put('/profile/personal', updatePersonal);
router.put('/profile/academic', updateAcademic);

export default router;

