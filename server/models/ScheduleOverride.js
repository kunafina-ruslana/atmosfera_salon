import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScheduleOverride = sequelize.define('ScheduleOverride', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  masterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Masters',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  breakStart: {
    type: DataTypes.TIME,
    allowNull: true
  },
  breakEnd: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isDayOff: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'custom'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default ScheduleOverride;