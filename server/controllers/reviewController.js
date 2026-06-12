import { Review, User, Master } from '../models/index.js';
import { upload } from '../middleware/upload.js';

export const createReview = async (req, res) => {
  try {
    const { masterId, text, rating, photos } = req.body;
    
    const review = await Review.create({
      userId: req.user.id,
      masterId,
      text,
      rating,
      photos: photos || [],
      isModerated: false
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isModerated: true },
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const moderateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    review.isModerated = true;
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    await review.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};