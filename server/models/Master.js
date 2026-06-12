import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Master = sequelize.define('Master', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  bio: {
    type: DataTypes.TEXT
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  scheduleSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
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
    }
  }
});

export default Master;