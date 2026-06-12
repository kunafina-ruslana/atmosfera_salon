import { Appointment, Service, Master, User, Category, CategoryMaster } from '../models/index.js';
import { Op } from 'sequelize';

export const createAppointment = async (req, res) => {
  try {
    const { serviceId, masterId, dateTime } = req.body;
    
    // Проверка существования услуги
    const service = await Service.findByPk(serviceId);
    if (!service) {return res.status(404).json({ error: 'Услуга не найдена' });}
    
    // Проверка существование мастера
    const master = await Master.findByPk(masterId);
    if (!master) {return res.status(404).json({ error: 'Мастер не найден' });}
    
    // Проверка категории мастера
    const categoryMaster = await CategoryMaster.findOne({
      where: {
        masterId: masterId,
        categoryId: service.categoryId
      }
    });
    if (!categoryMaster) {return res.status(400).json({ error: 'Мастер не выполняет эту услугу' });}
    
    const appointmentTime = new Date(dateTime);
    const appointmentEnd = new Date(appointmentTime.getTime() + service.duration * 60000);
    
    // Проверка не занято ли время
    const conflictingAppointment = await Appointment.findOne({
      where: {
        masterId,
        status: { [Op.ne]: 'cancelled' },
        [Op.or]: [
          {
            dateTime: {
              [Op.between]: [appointmentTime, appointmentEnd]
            }
          },
          {
            [Op.and]: [
              { dateTime: { [Op.lte]: appointmentTime } },
              {
                dateTime: {
                  [Op.gte]: appointmentTime
                }
              }
            ]
          }
        ]
      }
    });
    
    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Это время уже занято' });
    }
    
    // Создаем запись
    const appointment = await Appointment.create({
      userId: req.user.id,
      serviceId,
      masterId,
      dateTime: appointmentTime,
      status: 'confirmed'
    });
    
    // Возвращаем запись с полными данными
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Service },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ]
    });
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Ошибка создания записи:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Service },
        {
          model: Master,
          include: [{ model: User, attributes: ['firstName', 'lastName'] }]
        }
      ],
      order: [['dateTime', 'ASC']]
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Ошибка получения записей:', error);
    res.status(500).json({ error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Запись уже отменена' });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Ошибка отмены записи:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDateTime } = req.body;
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        status: { [Op.ne]: 'cancelled' }
      },
      include: [{ model: Service }]
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    const newTime = new Date(newDateTime);
    const newEnd = new Date(newTime.getTime() + appointment.Service.duration * 60000);
    
    const conflictingAppointment = await Appointment.findOne({
      where: {
        masterId: appointment.masterId,
        id: { [Op.ne]: appointment.id },
        status: { [Op.ne]: 'cancelled' },
        [Op.or]: [
          {
            dateTime: {
              [Op.between]: [newTime, newEnd]
            }
          }
        ]
      }
    });
    
    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Это время уже занято' });
    }
    
    appointment.dateTime = newTime;
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Ошибка переноса записи:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Ошибка обновления статуса записи:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMasterAppointments = async (req, res) => {
  try {
    const { masterId, date } = req.query;
    
    const where = { masterId };
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.dateTime = { [Op.between]: [startDate, endDate] };
    }
    
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Service },
        { model: User, attributes: ['firstName', 'lastName', 'phone'] }
      ],
      order: [['dateTime', 'ASC']]
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Ошибка получения записей мастера:', error);
    res.status(500).json({ error: error.message });
  }
};