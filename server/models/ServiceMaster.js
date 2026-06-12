import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ServiceMaster = sequelize.define('ServiceMaster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Services',
      key: 'id'
    }
  },
  masterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Masters',
      key: 'id'
    }
  }
});

export default ServiceMaster;