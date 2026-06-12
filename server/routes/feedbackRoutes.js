import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createFeedback,
  getFeedbacks,
  getAllFeedbacks,
  moderateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getFeedbacks);
router.get('/all', authenticate, authorize('admin'), getAllFeedbacks);
router.put('/:id/moderate', authenticate, authorize('admin'), moderateFeedback);
router.delete('/:id', authenticate, authorize('admin'), deleteFeedback);

export default router;