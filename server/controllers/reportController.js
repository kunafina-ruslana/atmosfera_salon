import { Appointment, Service, Master, User, Category } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getCompletedOrdersReport = async (req, res) => {
  try {
    const { startDate, endDate, masterId } = req.query;
  
    const where = {
      status: 'completed',
      dateTime: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };    
    if (masterId) where.masterId = masterId;    
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price', 'duration'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['dateTime', 'ASC']]
    });   
    const totalRevenue = appointments.reduce((sum, apt) => sum + parseFloat(apt.Service.price), 0);
    const totalOrders = appointments.length;
    const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;    
    res.json({
      summary: {
        totalOrders,
        totalRevenue,
        averageCheck,
        period: { startDate, endDate }
      },
      appointments: appointments.map(apt => ({
        id: apt.id,
        date: apt.dateTime,
        client: `${apt.User.firstName} ${apt.User.lastName}`,
        clientPhone: apt.User.phone,
        service: apt.Service.name,
        servicePrice: apt.Service.price,
        serviceDuration: apt.Service.duration,
        master: `${apt.Master.User.firstName} ${apt.Master.User.lastName}`,
        status: apt.status
      }))
    });
  } catch (error) {
    console.error('Ошибка получения отчета о заказах:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMasterServicesReport = async (req, res) => {
  try {
    const { startDate, endDate, masterId } = req.query;
    
    const where = {
      status: 'completed',
      dateTime: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
    
    if (masterId) where.masterId = masterId;
    
    const masterWhere = {};
    if (masterId) masterWhere.id = masterId;
    
    const masters = await Master.findAll({
      where: masterWhere,
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    const result = [];
    
    for (const master of masters) {
      const appointments = await Appointment.findAll({
        where: { ...where, masterId: master.id },
        include: [{ model: Service, attributes: ['id', 'name', 'price', 'duration'] }]
      });
      
      const servicesByCategory = {};
      let totalRevenue = 0;
      let totalServices = 0;
      
      appointments.forEach(apt => {
        const service = apt.Service;
        totalRevenue += parseFloat(service.price);
        totalServices++;
        
        if (!servicesByCategory[service.name]) {
          servicesByCategory[service.name] = {
            serviceName: service.name,
            count: 0,
            revenue: 0,
            duration: service.duration
          };
        }
        servicesByCategory[service.name].count++;
        servicesByCategory[service.name].revenue += parseFloat(service.price);
      });
      
      result.push({
        masterId: master.id,
        masterName: `${master.User.firstName} ${master.User.lastName}`,
        totalServices,
        totalRevenue,
        averagePerService: totalServices > 0 ? totalRevenue / totalServices : 0,
        services: Object.values(servicesByCategory)
      });
    }
    
    res.json({
      period: { startDate, endDate },
      masters: result
    });
  } catch (error) {
    console.error('Ошибка получения отчета по услугам мастеров:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const appointments = await Appointment.findAll({
      where: {
        status: 'completed',
        dateTime: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { model: Service, attributes: ['price', 'name'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['dateTime', 'ASC']]
    });
    
    let revenueByPeriod = {};
    let revenueByMaster = {};
    let revenueByService = {};
    let totalRevenue = 0;
    
    appointments.forEach(apt => {
      const price = parseFloat(apt.Service.price);
      totalRevenue += price;
      
      let periodKey;
      const date = new Date(apt.dateTime);
      if (groupBy === 'month') {
        periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else if (groupBy === 'week') {
        const weekNumber = Math.ceil(date.getDate() / 7);
        periodKey = `${date.getFullYear()}-${date.getMonth() + 1}-неделя ${weekNumber}`;
      } else {
        periodKey = date.toISOString().split('T')[0];
      }
      
      revenueByPeriod[periodKey] = (revenueByPeriod[periodKey] || 0) + price;
      
      const masterName = `${apt.Master.User.firstName} ${apt.Master.User.lastName}`;
      revenueByMaster[masterName] = (revenueByMaster[masterName] || 0) + price;
      
      revenueByService[apt.Service.name] = (revenueByService[apt.Service.name] || 0) + price;
    });
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalRevenue,
        totalOrders: appointments.length,
        averageCheck: appointments.length > 0 ? totalRevenue / appointments.length : 0
      },
      revenueByPeriod: Object.entries(revenueByPeriod).map(([period, revenue]) => ({ period, revenue })),
      revenueByMaster: Object.entries(revenueByMaster).map(([master, revenue]) => ({ master, revenue })),
      revenueByService: Object.entries(revenueByService).map(([service, revenue]) => ({ service, revenue }))
    });
  } catch (error) {
    console.error('Ошибка получения отчета по выручке:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMasterWorkloadReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const masters = await Master.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    const result = [];
    
    for (const master of masters) {
      const completedAppointments = await Appointment.findAll({
        where: {
          masterId: master.id,
          status: 'completed',
          dateTime: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        include: [{ model: Service, attributes: ['duration'] }]
      });
      
      const totalAppointments = completedAppointments.length;
      const totalWorkHours = completedAppointments.reduce((sum, apt) => sum + apt.Service.duration, 0) / 60;
      
      const dailyWorkload = {};
      completedAppointments.forEach(apt => {
        const date = apt.dateTime.toISOString().split('T')[0];
        dailyWorkload[date] = (dailyWorkload[date] || 0) + 1;
      });
      
      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const averageDailyAppointments = totalDays > 0 ? totalAppointments / totalDays : 0;
      
      let efficiencyRating = 'Средняя';
      if (averageDailyAppointments >= 4) efficiencyRating = 'Высокая';
      else if (averageDailyAppointments <= 2) efficiencyRating = 'Низкая';
      
      result.push({
        masterId: master.id,
        masterName: `${master.User.firstName} ${master.User.lastName}`,
        totalAppointments,
        totalWorkHours: totalWorkHours.toFixed(1),
        averageDailyAppointments: averageDailyAppointments.toFixed(1),
        efficiencyRating,
        dailyBreakdown: Object.entries(dailyWorkload).map(([date, count]) => ({ date, appointments: count }))
      });
    }
    
    const totalAppointmentsAll = result.reduce((sum, m) => sum + m.totalAppointments, 0);
    const averageWorkload = result.length > 0 ? totalAppointmentsAll / result.length : 0;
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalMasters: result.length,
        totalAppointmentsAll,
        averageWorkloadPerMaster: averageWorkload.toFixed(1),
        mostEfficientMaster: result.reduce((best, current) => 
          current.totalAppointments > (best?.totalAppointments || 0) ? current : best, null)
      },
      masters: result
    });
  } catch (error) {
    console.error('Ошибка получения отчета по загруженности мастеров:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPopularServicesReport = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    const appointments = await Appointment.findAll({
      where: {
        status: 'completed',
        dateTime: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { 
          model: Service,
          include: [{ model: Category, attributes: ['name'] }]
        }
      ]
    });
    
    const serviceStats = {};
    
    appointments.forEach(apt => {
      const service = apt.Service;
      if (!serviceStats[service.id]) {
        serviceStats[service.id] = {
          serviceId: service.id,
          serviceName: service.name,
          categoryName: service.Category?.name || 'Без категории',
          price: parseFloat(service.price),
          duration: service.duration,
          count: 0,
          totalRevenue: 0
        };
      }
      serviceStats[service.id].count++;
      serviceStats[service.id].totalRevenue += parseFloat(service.price);
    });
    
    const sortedServices = Object.values(serviceStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));
    
    const topByRevenue = [...sortedServices].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const topByDuration = [...sortedServices].sort((a, b) => b.duration - a.duration);
    
    const categoryStats = {};
    sortedServices.forEach(service => {
      if (!categoryStats[service.categoryName]) {
        categoryStats[service.categoryName] = {
          categoryName: service.categoryName,
          count: 0,
          totalRevenue: 0
        };
      }
      categoryStats[service.categoryName].count += service.count;
      categoryStats[service.categoryName].totalRevenue += service.totalRevenue;
    });
    
    const totalOrders = appointments.length;
    const totalRevenue = sortedServices.reduce((sum, s) => sum + s.totalRevenue, 0);
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalOrders,
        totalRevenue,
        uniqueServices: sortedServices.length
      },
      topByPopularity: sortedServices,
      topByRevenue: topByRevenue,
      topByDuration: topByDuration,
      byCategory: Object.values(categoryStats)
    });
  } catch (error) {
    console.error('Ошибка получения отчета по популярности услуг:', error);
    res.status(500).json({ error: error.message });
  }
};