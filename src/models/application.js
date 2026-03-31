'use strict';

module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    company: DataTypes.STRING,
    position: DataTypes.STRING,
    platform: DataTypes.STRING,
    status: DataTypes.STRING,
    appliedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: DataTypes.UUID
  });

  return Application;
};