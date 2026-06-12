import { User, Service, Category, Master, ScheduleOverride, ServiceMaster, Appointment, WorkPhoto, Promotion } from '../models/index.js';
import sequelize from '../config/database.js';
import path from 'path';
import fs from 'fs/promises';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    user.role = role;
    await user.save();
    
    if (role === 'master') {
      const existingMaster = await Master.findOne({ where: { userId: user.id } });
      if (!existingMaster) {
        await Master.create({ userId: user.id });
      }
    }
    
    res.json({ id: user.id, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    user.isBlocked = isBlocked;
    await user.save();
    
    res.json({ id: user.id, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const serviceData = { ...req.body };
    if (req.file) {
      serviceData.photo = req.file.filename;
    }
    const service = await Service.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateService = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const service = await Service.findByPk(req.params.id, { transaction });
    
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      duration: req.body.duration,
      price: req.body.price,
      categoryId: req.body.categoryId
    };
    
    if (req.file) {
      if (service.photo) {
        const oldPhotoPath = path.join(process.cwd(), 'uploads', 'services', service.photo);
        try {
          await fs.unlink(oldPhotoPath);
        } catch (err) {
          console.error('Не удалось удалить старое фото:', err.message);
        }
      }
      updateData.photo = req.file.filename;
    }
    
    await service.update(updateData, { transaction });
    await transaction.commit();
    
    res.json(service);
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка обновления услуги:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    await service.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryData = { name };
    if (req.file) {
      categoryData.photo = req.file.filename;
    }
    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    const { name } = req.body;
    const updateData = { name };
    
    if (req.file) {
      if (category.photo) {
        const oldPhotoPath = path.join(process.cwd(), 'uploads', 'categories', category.photo);
        try {
          await fs.unlink(oldPhotoPath);
        } catch (err) {}
      }
      updateData.photo = req.file.filename;
    }
    
    await category.update(updateData);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    await category.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMasters = async (req, res) => {
  try {
    const masters = await Master.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }]
    });
    res.json(masters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMaster = async (req, res) => {
  try {
    const master = await Master.create(req.body);
    res.status(201).json(master);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMaster = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const updateData = { bio: req.body.bio };
    
    console.log('req.file:', req.file); // Для отладки
    
    if (req.file) {
      // Удаляем старое фото
      if (master.photo) {
        const oldPhotoPath = path.join(process.cwd(), 'uploads', 'masters', master.photo);
        try {
          await fs.unlink(oldPhotoPath);
          console.log('Старое фото удалено:', oldPhotoPath);
        } catch (err) {
          console.error('Не удалось удалить старое фото:', err.message);
        }
      }
      updateData.photo = req.file.filename;
      console.log('Новое фото сохранено:', updateData.photo);
    }
    
    await master.update(updateData);
    
    const updatedMaster = await Master.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }]
    });
    
    res.json(updatedMaster);
  } catch (error) {
    console.error('Ошибка обновления мастера:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMaster = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    await master.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMasterSchedule = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const overrides = await ScheduleOverride.findAll({
      where: { masterId: master.id }
    });
    
    res.json({
      scheduleSettings: master.scheduleSettings,
      overrides
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMasterSchedule = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    master.scheduleSettings = req.body;
    await master.save();
    
    res.json(master.scheduleSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createScheduleOverride = async (req, res) => {
  try {
    const override = await ScheduleOverride.create({
      masterId: req.params.id,
      ...req.body
    });
    
    res.status(201).json(override);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignServiceToMaster = async (req, res) => {
  try {
    await ServiceMaster.create({
      masterId: req.params.masterId,
      serviceId: req.params.serviceId
    });
    
    res.status(201).json({ message: 'Услуга назначена мастеру' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeServiceFromMaster = async (req, res) => {
  try {
    await ServiceMaster.destroy({
      where: {
        masterId: req.params.masterId,
        serviceId: req.params.serviceId
      }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'email'] },
        { model: Service },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['dateTime', 'DESC']]
    });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkPhotos = async (req, res) => {
  try {
    const photos = await WorkPhoto.findAll({
      order: [['sortOrder', 'ASC']]
    });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkPhoto = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.imageUrl = req.file.filename;
    }
    const photo = await WorkPhoto.create(data);
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWorkPhoto = async (req, res) => {
  try {
    const photo = await WorkPhoto.findByPk(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Фото не найдено' });
    }
    
    const data = JSON.parse(req.body.data);
    if (req.file) {
      if (photo.imageUrl) {
        const oldPath = path.join(process.cwd(), 'uploads', 'works', photo.imageUrl);
        try {
          await fs.unlink(oldPath);
        } catch (err) {}
      }
      data.imageUrl = req.file.filename;
    }
    
    await photo.update(data);
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteWorkPhoto = async (req, res) => {
  try {
    const photo = await WorkPhoto.findByPk(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Фото не найдено' });
    }
    
    if (photo.imageUrl) {
      const filePath = path.join(process.cwd(), 'uploads', 'works', photo.imageUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {}
    }
    
    await photo.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.imageUrl = req.file.filename;
    }
    const promotion = await Promotion.create(data);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Акция не найдена' });
    }
    
    const data = JSON.parse(req.body.data);
    if (req.file) {
      if (promotion.imageUrl) {
        const oldPath = path.join(process.cwd(), 'uploads', 'promotions', promotion.imageUrl);
        try {
          await fs.unlink(oldPath);
        } catch (err) {}
      }
      data.imageUrl = req.file.filename;
    }
    
    await promotion.update(data);
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Акция не найдена' });
    }
    
    if (promotion.imageUrl) {
      const filePath = path.join(process.cwd(), 'uploads', 'promotions', promotion.imageUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {}
    }
    
    await promotion.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};