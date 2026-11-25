import { Router } from 'express';
import { listDocuments, uploadDocument, reuploadDocument, serveDocumentFile } from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();
router.use(protect);

router.get('/:applicationId', listDocuments);
router.post('/:applicationId/upload', authorize('student'), upload.single('file'), uploadDocument);
router.post('/:applicationId/:docId/reupload', authorize('student'), upload.single('file'), reuploadDocument);
router.get('/:applicationId/:docId/file', serveDocumentFile);

export default router;

