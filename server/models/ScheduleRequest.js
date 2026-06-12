import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScheduleRequest = sequelize.define('ScheduleRequest', {
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
  scheduleData: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
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

export default ScheduleRequest;