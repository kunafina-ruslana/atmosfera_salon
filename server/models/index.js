import User from './User.js';
import Category from './Category.js';
import Service from './Service.js';
import Master from './Master.js';
import ServiceMaster from './ServiceMaster.js';
import Appointment from './Appointment.js';
import Favorite from './Favorite.js';
import Review from './Review.js';
import ScheduleOverride from './ScheduleOverride.js';
import CategoryMaster from './CategoryMaster.js';
import WorkPhoto from './WorkPhoto.js';
import Promotion from './Promotion.js';
import ScheduleRequest from './ScheduleRequest.js';
import DayOffRequest from './DayOffRequest.js';
import Feedback from './Feedback.js';

// User associations
User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Master, { foreignKey: 'userId' });
Master.belongsTo(User, { foreignKey: 'userId' });

// Service associations
Service.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Service, { foreignKey: 'categoryId' });

Service.belongsToMany(Master, { through: ServiceMaster, foreignKey: 'serviceId' });
Master.belongsToMany(Service, { through: ServiceMaster, foreignKey: 'masterId' });

// Category associations
Category.belongsToMany(Master, { through: CategoryMaster, foreignKey: 'categoryId' });
Master.belongsToMany(Category, { through: CategoryMaster, foreignKey: 'masterId' });

// Appointment associations
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });
Appointment.belongsTo(Master, { foreignKey: 'masterId' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Service, { foreignKey: 'serviceId' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Master, { foreignKey: 'masterId' });

// ScheduleOverride associations
ScheduleOverride.belongsTo(Master, { foreignKey: 'masterId' });
Master.hasMany(ScheduleOverride, { foreignKey: 'masterId' });

// CategoryMaster associations
CategoryMaster.belongsTo(Master, { foreignKey: 'masterId' });
CategoryMaster.belongsTo(Category, { foreignKey: 'categoryId' });

// ScheduleRequest associations
ScheduleRequest.belongsTo(Master, { foreignKey: 'masterId' });
Master.hasMany(ScheduleRequest, { foreignKey: 'masterId' });

// DayOffRequest associations
DayOffRequest.belongsTo(Master, { foreignKey: 'masterId' });
Master.hasMany(DayOffRequest, { foreignKey: 'masterId' });

export {
  User,
  Category,
  Service,
  Master,
  ServiceMaster,
  Appointment,
  Favorite,
  Review,
  ScheduleOverride,
  CategoryMaster,
  WorkPhoto,
  Promotion,
  ScheduleRequest,
  DayOffRequest,
  Feedback
};