import { Service, Category, Master, ServiceMaster, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getServices = async (req, res) => {
  try {
    const { categoryId, minDuration, maxDuration, minPrice, maxPrice, masterId, search } = req.query;
    const where = {};
    const include = [{ model: Category }];
    
    if (categoryId) where.categoryId = categoryId;
    if (minDuration) where.duration = { [Op.gte]: minDuration };
    if (maxDuration) where.duration = { ...where.duration, [Op.lte]: maxDuration };
    if (minPrice) where.price = { [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    
    if (masterId) {
      include.push({
        model: Master,
        where: { id: masterId },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: Master,
        through: { attributes: [] }
      });
    }
    
    const services = await Service.findAll({ where, include });
    res.json(services);
  } catch (error) {
    console.error('Ошибка в getServices:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Master,
          through: { attributes: [] },
          include: [{ model: User, attributes: ['firstName', 'lastName'] }]
        }
      ]
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Ошибка в getServiceById:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getServiceMasters = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: Category }
      ]
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    // Находим мастеров, у которых есть эта категория
    const masters = await Master.findAll({
      include: [
        { 
          model: User, 
          attributes: ['firstName', 'lastName'] 
        },
        {
          model: Category,
          where: { id: service.categoryId },
          through: { attributes: [] },
          required: true
        }
      ]
    });
    
    res.json(masters);
  } catch (error) {
    console.error('Ошибка в getServiceMasters:', error);
    res.status(500).json({ error: error.message });
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Ошибка в getCategories:', error);
    res.status(500).json({ error: error.message });
  }
};