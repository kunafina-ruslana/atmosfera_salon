import { Master, ScheduleOverride, Appointment, Service, CategoryMaster, Category, User } from '../models/index.js';
import { Op } from 'sequelize';

export const generateSlots = async (req, res) => {
  try {
    const { masterId, date, serviceId } = req.query;
    
    console.log('Генерация слотов:', { masterId, date, serviceId });
    
    if (!masterId || !date || !serviceId) {
      return res.status(400).json({ error: 'Не указаны обязательные параметры' });
    }
    
    const master = await Master.findByPk(masterId);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    // Проверяем наличие расписания
    if (!master.scheduleSettings || !master.scheduleSettings.weekSchedule) {
      console.log('У мастера нет расписания, создаем дефолтное');
      master.scheduleSettings = {
        weekSchedule: {
          monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          saturday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          sunday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' }
        },
        techBreakMinutes: 15
      };
      await master.save();
    }
    
    const targetDate = new Date(date);
    // Получаем день недели (0 - воскресенье, 1 - понедельник, и т.д.)
    const dayOfWeek = targetDate.getDay();
    // Маппинг дней недели
    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    const dayName = dayMap[dayOfWeek];
    
    // Получаем расписание на день недели
    let daySchedule = master.scheduleSettings.weekSchedule[dayName];
    
    if (!daySchedule || !daySchedule.isWorking) {
      return res.json([]);
    }
    
    // Получаем существующие записи на эту дату
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await Appointment.findAll({
      where: {
        masterId,
        dateTime: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: { [Op.not]: 'cancelled' }
      }
    });
    
    // Генерация слотов
    const slots = [];
    const startHour = parseInt(daySchedule.start.split(':')[0]);
    const startMinute = parseInt(daySchedule.start.split(':')[1]);
    const endHour = parseInt(daySchedule.end.split(':')[0]);
    const endMinute = parseInt(daySchedule.end.split(':')[1]);
    
    const breakStartHour = daySchedule.breakStart ? parseInt(daySchedule.breakStart.split(':')[0]) : null;
    const breakStartMinute = daySchedule.breakStart ? parseInt(daySchedule.breakStart.split(':')[1]) : null;
    const breakEndHour = daySchedule.breakEnd ? parseInt(daySchedule.breakEnd.split(':')[0]) : null;
    const breakEndMinute = daySchedule.breakEnd ? parseInt(daySchedule.breakEnd.split(':')[1]) : null;
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const serviceDuration = parseInt(service.duration);
    const techBreak = master.scheduleSettings.techBreakMinutes || 15;
    
    let slotCount = 0;
    while (currentTime.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      let isAvailable = true;
      let isBreak = false;
      
      // Проверка на обеденный перерыв
      if (breakStartHour !== null && breakEndHour !== null) {
        const breakStart = breakStartHour * 60 + breakStartMinute;
        const breakEnd = breakEndHour * 60 + breakEndMinute;
        const currentTotal = currentHour * 60 + currentMinute;
        const slotEndTotal = slotEnd.getHours() * 60 + slotEnd.getMinutes();
        
        if ((currentTotal >= breakStart && currentTotal < breakEnd) ||
            (slotEndTotal > breakStart && slotEndTotal <= breakEnd) ||
            (currentTotal <= breakStart && slotEndTotal >= breakEnd)) {
          isBreak = true;
          isAvailable = false;
        }
      }
      
      // Проверка на существующие записи
      for (const apt of appointments) {
        const aptStart = new Date(apt.dateTime);
        const aptService = apt.Service;
        const aptDuration = aptService ? parseInt(aptService.duration) : serviceDuration;
        const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
        
        if ((currentTime >= aptStart && currentTime < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd)) {
          isAvailable = false;
          break;
        }
      }
      
      slots.push({
        start: new Date(currentTime),
        end: slotEnd,
        isAvailable,
        isBreak
      });
      
      // Увеличиваем время
      currentTime.setMinutes(currentTime.getMinutes() + techBreak + serviceDuration);
      slotCount++;
      
      // Защита от бесконечного цикла
      if (slotCount > 100) break;
    }
    
    console.log(`Сгенерировано ${slots.length} слотов для ${dayName}`);
    res.json(slots);
  } catch (error) {
    console.error('Ошибка генерации слотов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение расписания мастера на неделю
export const getMasterWeekSchedule = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    // Проверяем наличие расписания
    if (!master.scheduleSettings || !master.scheduleSettings.weekSchedule) {
      master.scheduleSettings = {
        weekSchedule: {
          monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          saturday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          sunday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' }
        },
        techBreakMinutes: 15
      };
      await master.save();
    }
    
    const overrides = await ScheduleOverride.findAll({
      where: {
        masterId: master.id,
        status: 'approved'
      }
    });
    
    res.json({
      weekSchedule: master.scheduleSettings.weekSchedule,
      techBreakMinutes: master.scheduleSettings.techBreakMinutes,
      overrides
    });
  } catch (error) {
    console.error('Ошибка получения расписания:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление недельного расписания (только для админа)
export const updateWeekSchedule = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    master.scheduleSettings.weekSchedule = req.body.weekSchedule;
    master.scheduleSettings.techBreakMinutes = req.body.techBreakMinutes;
    await master.save();
    
    res.json(master.scheduleSettings);
  } catch (error) {
    console.error('Ошибка обновления расписания:', error);
    res.status(500).json({ error: error.message });
  }
};

// Запрос на изменение расписания от мастера
export const requestScheduleChange = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    master.scheduleSettings.pendingChanges = req.body;
    await master.save();
    
    res.json({ message: 'Запрос отправлен администратору' });
  } catch (error) {
    console.error('Ошибка отправки запроса:', error);
    res.status(500).json({ error: error.message });
  }
};

// Создание исключения в расписании
export const createOverride = async (req, res) => {
  try {
    const { masterId } = req.params;
    const { date, startTime, endTime, breakStart, breakEnd, isDayOff, reason } = req.body;
    
    const existing = await ScheduleOverride.findOne({
      where: { masterId, date }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Исключение на эту дату уже существует' });
    }
    
    const override = await ScheduleOverride.create({
      masterId,
      date,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      isDayOff,
      reason,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    res.status(201).json(override);
  } catch (error) {
    console.error('Ошибка создания исключения:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление исключения
export const deleteOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const override = await ScheduleOverride.findByPk(id);
    
    if (!override) {
      return res.status(404).json({ error: 'Исключение не найдено' });
    }
    
    await override.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления исключения:', error);
    res.status(500).json({ error: error.message });
  }
};

// Массовое создание исключений (например, на праздники)
export const bulkCreateOverrides = async (req, res) => {
  try {
    const { masterId, dates, startTime, endTime, breakStart, breakEnd, isDayOff, reason } = req.body;
    
    const overrides = [];
    for (const date of dates) {
      const existing = await ScheduleOverride.findOne({
        where: { masterId, date }
      });
      
      if (!existing) {
        const override = await ScheduleOverride.create({
          masterId,
          date,
          startTime,
          endTime,
          breakStart,
          breakEnd,
          isDayOff,
          reason,
          status: req.user.role === 'admin' ? 'approved' : 'pending'
        });
        overrides.push(override);
      }
    }
    
    res.status(201).json(overrides);
  } catch (error) {
    console.error('Ошибка массового создания исключений:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение запросов на изменение расписания (для админа)
export const getPendingRequests = async (req, res) => {
  try {
    const masters = await Master.findAll({
      where: {
        'scheduleSettings.pendingChanges': { [Op.ne]: null }
      },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    const requests = masters.map(master => ({
      masterId: master.id,
      masterName: `${master.User.firstName} ${master.User.lastName}`,
      pendingChanges: master.scheduleSettings.pendingChanges
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения запросов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Подтверждение запроса на изменение расписания
export const approveScheduleChange = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    if (master.scheduleSettings.pendingChanges) {
      master.scheduleSettings.weekSchedule = master.scheduleSettings.pendingChanges.weekSchedule || master.scheduleSettings.weekSchedule;
      master.scheduleSettings.techBreakMinutes = master.scheduleSettings.pendingChanges.techBreakMinutes || master.scheduleSettings.techBreakMinutes;
      master.scheduleSettings.pendingChanges = null;
      await master.save();
    }
    
    res.json({ message: 'Изменения подтверждены' });
  } catch (error) {
    console.error('Ошибка подтверждения изменений:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отклонение запроса на изменение расписания
export const rejectScheduleChange = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    master.scheduleSettings.pendingChanges = null;
    await master.save();
    
    res.json({ message: 'Запрос отклонен' });
  } catch (error) {
    console.error('Ошибка отклонения запроса:', error);
    res.status(500).json({ error: error.message });
  }
};

// Назначение категорий мастеру
export const assignCategoryToMaster = async (req, res) => {
  try {
    const { masterId, categoryId } = req.params;
    
    await CategoryMaster.create({
      masterId,
      categoryId
    });
    
    res.status(201).json({ message: 'Категория назначена мастеру' });
  } catch (error) {
    console.error('Ошибка назначения категории:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление категории у мастера
export const removeCategoryFromMaster = async (req, res) => {
  try {
    const { masterId, categoryId } = req.params;
    
    await CategoryMaster.destroy({
      where: { masterId, categoryId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение категорий мастера
export const getMasterCategories = async (req, res) => {
  try {
    const categories = await CategoryMaster.findAll({
      where: { masterId: req.params.masterId },
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех мастеров с их категориями для таймлайна
export const getAllMastersWithSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const masters = await Master.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        { model: Category, through: { attributes: [] }, attributes: ['id', 'name'] }
      ]
    });
    
    const result = [];
    for (const master of masters) {
      const appointments = await Appointment.findAll({
        where: {
          masterId: master.id,
          dateTime: {
            [Op.between]: [
              new Date(new Date(date).setHours(0, 0, 0, 0)),
              new Date(new Date(date).setHours(23, 59, 59, 999))
            ]
          },
          status: { [Op.not]: 'cancelled' }
        },
        include: [{ model: Service, attributes: ['id', 'name', 'duration'] }]
      });
      
      result.push({
        id: master.id,
        user: master.User,
        categories: master.Categories,
        appointments
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Ошибка получения расписания мастеров:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMasterCategories = async (req, res) => {
  try {
    const masterCategories = await CategoryMaster.findAll({
      include: [
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Category }
      ]
    });
    res.json(masterCategories);
  } catch (error) {
    console.error('Ошибка получения категорий мастеров:', error);
    res.status(500).json({ error: error.message });
  }
};
export const initializeMasterSchedule = async (req, res) => {
  try {
    const { masterId } = req.params;
    
    const master = await Master.findByPk(masterId);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const defaultSchedule = {
      weekSchedule: {
        monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        sunday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' }
      },
      techBreakMinutes: 15,
      pendingChanges: null
    };
    
    master.scheduleSettings = defaultSchedule;
    await master.save();
    
    res.json({ message: 'Расписание инициализировано', schedule: master.scheduleSettings });
  } catch (error) {
    console.error('Ошибка инициализации расписания:', error);
    res.status(500).json({ error: error.message });
  }
};