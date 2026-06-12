import express from 'express';
import { 
  createReview, 
  getReviews, 
  getAllReviews, 
  moderateReview, 
  deleteReview 
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createReview);
router.get('/', getReviews);
router.get('/all', authenticate, authorize('admin'), getAllReviews);
router.put('/:id/moderate', authenticate, authorize('admin'), moderateReview);
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

export default router;