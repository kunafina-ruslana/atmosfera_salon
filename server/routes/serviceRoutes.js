import express from 'express';
import { getServices, getServiceById, getServiceMasters, getCategories } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);
router.get('/:id/masters', getServiceMasters);

export default router;