import { Router } from 'express';
import { listActiveCourses, getCourseById } from '../controllers/course.controller.js';

const router = Router();
router.get('/', listActiveCourses);
router.get('/:id', getCourseById);

export default router;

