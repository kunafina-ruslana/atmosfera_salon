import WorkPhoto from '../models/WorkPhoto.js';
import Promotion from '../models/Promotion.js';

export const getWorkPhotos = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    
    const photos = await WorkPhoto.findAll({
      where,
      order: [['sortOrder', 'ASC']]
    });
    res.json(photos);
  } catch (error) {
    console.error('Ошибка загрузки фото работ:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      where: {
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Найдено акций в БД:', promotions.length);
    res.json(promotions);
  } catch (error) {
    console.error('Ошибка загрузки акций из БД:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};