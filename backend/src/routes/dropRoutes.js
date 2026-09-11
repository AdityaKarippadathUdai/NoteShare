import express from 'express';
import { createDrop, deleteDropByCode, downloadDrop, getDrop, verifyPassword } from '../controllers/dropController.js';
import upload from '../middleware/upload.js';
import { dropCreateLimiter, dropLookupLimiter, downloadLimiter, verifyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', dropCreateLimiter, upload.single('file'), createDrop);
router.get('/:code', dropLookupLimiter, getDrop);
router.post('/:code/verify', verifyLimiter, verifyPassword);
router.get('/:code/download', downloadLimiter, downloadDrop);
router.delete('/:code', dropLookupLimiter, deleteDropByCode);

export default router;
