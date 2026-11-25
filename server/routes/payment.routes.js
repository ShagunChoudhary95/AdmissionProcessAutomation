import { Router } from 'express';
import { createOrder, verifyPayment, downloadReceipt } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
router.use(protect);

router.post('/create-order', authorize('student'), createOrder);
router.post('/verify', authorize('student'), verifyPayment);
router.get('/:applicationId/receipt', downloadReceipt);

export default router;

