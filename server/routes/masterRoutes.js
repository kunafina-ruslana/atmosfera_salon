import express from 'express';
import { getMasters, getMasterById, getMasterSlots } from '../controllers/masterController.js';

const router = express.Router();

router.get('/', getMasters);
router.get('/:id', getMasterById);
router.get('/:id/slots', getMasterSlots);

export default router;