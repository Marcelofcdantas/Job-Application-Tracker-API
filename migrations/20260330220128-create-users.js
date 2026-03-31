'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mustChangePassword: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      temporaryPasswordExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      passwordHistory: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      mfaCodeHash: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      mfaCodeExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  },
};