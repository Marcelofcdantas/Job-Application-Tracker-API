'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'stages', {
      type: Sequelize.JSON,
    });
    await queryInterface.addColumn('Applications', 'currentStage', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('Applications', 'history', {
      type: Sequelize.JSON,
    });
    await queryInterface.addColumn('Applications', 'interviewDate', {
      type: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Applications', 'stages');
    await queryInterface.removeColumn('Applications', 'currentStage');
    await queryInterface.removeColumn('Applications', 'history');
    await queryInterface.removeColumn('Applications', 'interviewDate');
  }
};
