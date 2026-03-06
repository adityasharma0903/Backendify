import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Todo = sequelize.define(
  'Todo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    completed: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  },
  {
    tableName: 'todos',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['isDeleted'] },
      { fields: ['createdAt'] }
    ],
    hooks: {
      beforeUpdate: (instance) => {
        if (instance.changed()) {
          instance.version = (instance.version || 0) + 1;
        }
      }
    }
  }
);

// Static method for soft delete
Todo.softDelete = async function(id) {
  return this.update(
    { isDeleted: true },
    { where: { id } }
  );
};

// Static method to find all active
Todo.findAllActive = async function(options = {}) {
  return this.findAll({
    where: { isActive: true, isDeleted: false },
    order: options.sort || [['createdAt', 'DESC']],
    limit: options.limit || 100,
    offset: options.skip || 0
  });
};

export default Todo;
