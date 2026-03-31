'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      company: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      position: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Applied',
      },

      appliedDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('Applications', ['userId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Applications');
  },
};