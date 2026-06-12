import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:serviceId', removeFavorite);

export default router;