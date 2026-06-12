import { Favorite, Service } from '../models/index.js';

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Service }]
    });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    const existing = await Favorite.findOne({
      where: {
        userId: req.user.id,
        serviceId
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Уже в избранном' });
    }
    
    const favorite = await Favorite.create({
      userId: req.user.id,
      serviceId
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const deleted = await Favorite.destroy({
      where: {
        userId: req.user.id,
        serviceId: req.params.serviceId
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ error: 'Не найдено в избранном' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};