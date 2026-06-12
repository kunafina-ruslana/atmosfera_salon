import express from 'express';
import { getWorkPhotos, getPromotions } from '../controllers/publicController.js';

const router = express.Router();

router.get('/work-photos', getWorkPhotos);
router.get('/promotions', getPromotions);

export default router;