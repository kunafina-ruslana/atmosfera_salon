import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkPhoto = sequelize.define('WorkPhoto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  masterName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default WorkPhoto;