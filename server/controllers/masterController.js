import { Master, User, Service, Appointment, ScheduleOverride } from '../models/index.js';
import { Op } from 'sequelize';

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

export const getMasterById = async (req, res) => {
  try {
    const master = await Master.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }]
    });
    
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    res.json(master);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMasterSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    const master = await Master.findByPk(req.params.id);
    
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('ru-RU', { weekday: 'lowercase' });
    
    const override = await ScheduleOverride.findOne({
      where: {
        masterId: master.id,
        date: targetDate
      }
    });
    
    let workingHours;
    if (override && override.isDayOff) {
      workingHours = null;
    } else if (override && override.startTime && override.endTime) {
      workingHours = {
        start: override.startTime,
        end: override.endTime,
        breakStart: override.breakStart,
        breakEnd: override.breakEnd
      };
    } else {
      const weekSchedule = master.scheduleSettings.weekSchedule[dayOfWeek];
      if (!weekSchedule.isWorking) {
        workingHours = null;
      } else {
        workingHours = {
          start: weekSchedule.start,
          end: weekSchedule.end,
          breakStart: weekSchedule.breakStart,
          breakEnd: weekSchedule.breakEnd
        };
      }
    }
    
    if (!workingHours) {
      return res.json([]);
    }
    
    const appointments = await Appointment.findAll({
      where: {
        masterId: master.id,
        dateTime: {
          [Op.between]: [
            new Date(targetDate.setHours(0, 0, 0, 0)),
            new Date(targetDate.setHours(23, 59, 59, 999))
          ]
        },
        status: { [Op.not]: 'cancelled' }
      }
    });
    
    const slots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1]);
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const breakStartTime = workingHours.breakStart ? new Date(date) : null;
    if (breakStartTime) {
      breakStartTime.setHours(parseInt(workingHours.breakStart.split(':')[0]), parseInt(workingHours.breakStart.split(':')[1]), 0, 0);
    }
    const breakEndTime = workingHours.breakEnd ? new Date(date) : null;
    if (breakEndTime) {
      breakEndTime.setHours(parseInt(workingHours.breakEnd.split(':')[0]), parseInt(workingHours.breakEnd.split(':')[1]), 0, 0);
    }
    
    while (currentTime.getTime() + service.duration * 60000 <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);
      
      let isAvailable = true;
      
      if (breakStartTime && breakEndTime) {
        if ((currentTime >= breakStartTime && currentTime < breakEndTime) ||
            (slotEnd > breakStartTime && slotEnd <= breakEndTime)) {
          isAvailable = false;
        }
      }
      
      for (const apt of appointments) {
        const aptStart = new Date(apt.dateTime);
        const aptEnd = new Date(aptStart.getTime() + service.duration * 60000);
        
        if ((currentTime >= aptStart && currentTime < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (currentTime <= aptStart && slotEnd >= aptEnd)) {
          isAvailable = false;
          break;
        }
      }
      
      if (isAvailable) {
        slots.push(new Date(currentTime));
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + master.scheduleSettings.techBreakMinutes + service.duration);
    }
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};