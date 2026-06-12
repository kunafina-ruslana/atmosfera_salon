import { Master, ScheduleOverride, ScheduleRequest, DayOffRequest, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getMyOwnSchedule = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const master = await Master.findOne({ 
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    if (!master) {
      return res.status(404).json({ error: 'Профиль мастера не найден' });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const overrides = await ScheduleOverride.findAll({
      where: {
        masterId: master.id,
        date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'approved'
      }
    });
    
    const dayOffRequests = await DayOffRequest.findAll({
      where: {
        masterId: master.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    const schedule = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const dayMap = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
      const dayName = dayMap[dayOfWeek];
      
      let daySchedule = null;
      if (master.scheduleSettings && master.scheduleSettings.weekSchedule) {
        daySchedule = master.scheduleSettings.weekSchedule[dayName];
      }
      
      const override = overrides.find(o => o.date === dateStr);
      const dayOffRequest = dayOffRequests.find(r => r.date === dateStr);
      
      if (override && override.isDayOff) {
        schedule[dateStr] = { isWorking: false, reason: override.reason, type: 'override' };
      } else if (override) {
        schedule[dateStr] = {
          isWorking: true,
          start: override.startTime,
          end: override.endTime,
          breakStart: override.breakStart,
          breakEnd: override.breakEnd,
          type: 'override'
        };
      } else if (dayOffRequest && dayOffRequest.status === 'approved') {
        schedule[dateStr] = { isWorking: false, reason: dayOffRequest.reason, type: 'dayoff' };
      } else if (dayOffRequest && dayOffRequest.status === 'pending') {
        schedule[dateStr] = { isWorking: true, pendingDayOff: true, reason: dayOffRequest.reason };
      } else if (daySchedule && daySchedule.isWorking) {
        schedule[dateStr] = {
          isWorking: true,
          start: daySchedule.start,
          end: daySchedule.end,
          breakStart: daySchedule.breakStart,
          breakEnd: daySchedule.breakEnd,
          type: 'default'
        };
      } else {
        schedule[dateStr] = { isWorking: false, type: 'default' };
      }
    }
    
    res.json({
      master: {
        id: master.id,
        name: `${master.User.firstName} ${master.User.lastName}`,
        scheduleSettings: master.scheduleSettings
      },
      year: parseInt(year),
      month: parseInt(month),
      schedule,
      techBreakMinutes: master.scheduleSettings?.techBreakMinutes || 15
    });
  } catch (error) {
    console.error('Ошибка получения расписания мастера:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createScheduleRequest = async (req, res) => {
  try {
    const master = await Master.findOne({ where: { userId: req.user.id } });
    
    if (!master) {
      return res.status(404).json({ error: 'Профиль мастера не найден' });
    }
    
    const { weekSchedule, techBreakMinutes } = req.body;
    
    if (!weekSchedule) {
      return res.status(400).json({ error: 'Нет данных расписания' });
    }
    
    const existingRequest = await ScheduleRequest.findOne({
      where: {
        masterId: master.id,
        status: 'pending'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'У вас уже есть ожидающий запрос на изменение расписания' });
    }
    
    const request = await ScheduleRequest.create({
      masterId: master.id,
      scheduleData: { weekSchedule, techBreakMinutes: techBreakMinutes || 15 },
      status: 'pending'
    });
    
    res.status(201).json({ message: 'Запрос на изменение расписания отправлен администратору', request });
  } catch (error) {
    console.error('Ошибка создания запроса:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createDayOffRequest = async (req, res) => {
  try {
    const master = await Master.findOne({ where: { userId: req.user.id } });
    
    if (!master) {
      return res.status(404).json({ error: 'Профиль мастера не найден' });
    }
    
    const { date, type, reason } = req.body;
    
    if (!date || !reason) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    
    const existingRequest = await DayOffRequest.findOne({
      where: {
        masterId: master.id,
        date,
        status: 'pending'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Запрос на этот день уже отправлен' });
    }
    
    const request = await DayOffRequest.create({
      masterId: master.id,
      date,
      type: type || 'personal',
      reason,
      status: 'pending'
    });
    
    res.status(201).json({ message: 'Запрос на пропуск дня отправлен администратору', request });
  } catch (error) {
    console.error('Ошибка создания запроса на пропуск:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingScheduleRequests = async (req, res) => {
  try {
    const requests = await ScheduleRequest.findAll({
      where: { status: 'pending' },
      include: [{
        model: Master,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(requests || []);
  } catch (error) {
    console.error('Ошибка получения запросов:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingDayOffRequests = async (req, res) => {
  try {
    const requests = await DayOffRequest.findAll({
      where: { status: 'pending' },
      include: [{
        model: Master,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(requests || []);
  } catch (error) {
    console.error('Ошибка получения запросов на пропуск:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approveScheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await ScheduleRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    const master = await Master.findByPk(request.masterId);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    // Сохраняем предложенное расписание
    master.scheduleSettings = {
      weekSchedule: request.scheduleData.weekSchedule,
      techBreakMinutes: request.scheduleData.techBreakMinutes || 15,
      pendingChanges: null
    };
    await master.save();
    
    // Обновляем статус запроса
    request.status = 'approved';
    await request.save();
    
    res.json({ message: 'Расписание утверждено и сохранено' });
  } catch (error) {
    console.error('Ошибка утверждения запроса:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectScheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await ScheduleRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'Причина не указана';
    await request.save();
    
    res.json({ message: 'Запрос отклонен' });
  } catch (error) {
    console.error('Ошибка отклонения запроса:', error);
    res.status(500).json({ error: error.message });
  }
};
export const approveDayOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await DayOffRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    // Преобразуем тип в допустимое значение для reason
    let reasonValue = 'custom';
    if (request.type === 'vacation') reasonValue = 'vacation';
    if (request.type === 'sick') reasonValue = 'sick';
    if (request.type === 'holiday') reasonValue = 'holiday';
    if (request.type === 'personal') reasonValue = 'custom';
    
    // Создаем исключение в расписании
    await ScheduleOverride.create({
      masterId: request.masterId,
      date: request.date,
      isDayOff: true,
      reason: reasonValue,
      status: 'approved'
    });
    
    request.status = 'approved';
    await request.save();
    
    res.json({ message: 'Пропуск дня утвержден' });
  } catch (error) {
    console.error('Ошибка утверждения пропуска:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectDayOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await DayOffRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'Причина не указана';
    await request.save();
    
    res.json({ message: 'Запрос на пропуск отклонен' });
  } catch (error) {
    console.error('Ошибка отклонения пропуска:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMasterScheduleDirect = async (req, res) => {
  try {
    const { masterId } = req.params;
    const { weekSchedule, techBreakMinutes, overrides } = req.body;
    
    const master = await Master.findByPk(masterId);
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    master.scheduleSettings = {
      weekSchedule,
      techBreakMinutes: techBreakMinutes || 15,
      pendingChanges: null
    };
    await master.save();
    
    if (overrides && overrides.length > 0) {
      for (const override of overrides) {
        const existingOverride = await ScheduleOverride.findOne({
          where: { masterId, date: override.date }
        });
        
        if (existingOverride) {
          await existingOverride.update({
            startTime: override.startTime,
            endTime: override.endTime,
            breakStart: override.breakStart,
            breakEnd: override.breakEnd,
            isDayOff: override.isDayOff || false,
            reason: override.reason,
            status: 'approved'
          });
        } else {
          await ScheduleOverride.create({
            masterId,
            date: override.date,
            startTime: override.startTime,
            endTime: override.endTime,
            breakStart: override.breakStart,
            breakEnd: override.breakEnd,
            isDayOff: override.isDayOff || false,
            reason: override.reason,
            status: 'approved'
          });
        }
      }
    }
    
    res.json({ message: 'Расписание обновлено', schedule: master.scheduleSettings });
  } catch (error) {
    console.error('Ошибка обновления расписания:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMyScheduleRequests = async (req, res) => {
  try {
    const master = await Master.findOne({ where: { userId: req.user.id } });
    if (!master) {
      return res.status(404).json({ error: 'Профиль мастера не найден' });
    }
    
    const scheduleRequests = await ScheduleRequest.findAll({
      where: { masterId: master.id },
      order: [['createdAt', 'DESC']]
    });
    
    const dayOffRequests = await DayOffRequest.findAll({
      where: { masterId: master.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ scheduleRequests: scheduleRequests || [], dayOffRequests: dayOffRequests || [] });
  } catch (error) {
    console.error('Ошибка получения запросов мастера:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMasterScheduleWithRequests = async (req, res) => {
  try {
    const { masterId } = req.params;
    const { year, month } = req.query;
    
    const master = await Master.findByPk(masterId, {
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const overrides = await ScheduleOverride.findAll({
      where: {
        masterId,
        date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'approved'
      }
    });
    
    const schedule = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const dayMap = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
      const dayName = dayMap[dayOfWeek];
      
      let daySchedule = null;
      if (master.scheduleSettings && master.scheduleSettings.weekSchedule) {
        daySchedule = master.scheduleSettings.weekSchedule[dayName];
      }
      
      const override = overrides.find(o => o.date === dateStr);
      
      if (override && override.isDayOff) {
        schedule[dateStr] = { isWorking: false, reason: override.reason, type: 'override' };
      } else if (override) {
        schedule[dateStr] = {
          isWorking: true,
          start: override.startTime,
          end: override.endTime,
          breakStart: override.breakStart,
          breakEnd: override.breakEnd,
          type: 'override'
        };
      } else if (daySchedule && daySchedule.isWorking) {
        schedule[dateStr] = {
          isWorking: true,
          start: daySchedule.start,
          end: daySchedule.end,
          breakStart: daySchedule.breakStart,
          breakEnd: daySchedule.breakEnd,
          type: 'default'
        };
      } else {
        schedule[dateStr] = { isWorking: false, type: 'default' };
      }
    }
    
    res.json({
      master: {
        id: master.id,
        name: `${master.User.firstName} ${master.User.lastName}`,
        scheduleSettings: master.scheduleSettings
      },
      year: parseInt(year),
      month: parseInt(month),
      schedule,
      techBreakMinutes: master.scheduleSettings?.techBreakMinutes || 15
    });
  } catch (error) {
    console.error('Ошибка получения расписания:', error);
    res.status(500).json({ error: error.message });
  }
};