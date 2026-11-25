import { Router } from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ notifications });
});

router.put('/read-all', async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.json({ message: 'All marked as read' });
});

router.put('/:id/read', async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: { isRead: true } });
  res.json({ message: 'Marked as read' });
});

export default router;

