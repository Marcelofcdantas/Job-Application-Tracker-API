'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn("users", "emailVerificationLastSentAt", {
    type: Sequelize.DATE,
    allowNull: true,
    });

    await queryInterface.addColumn("users", "emailVerificationToken", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "emailVerificationLastSentAt");
    await queryInterface.removeColumn("users", "emailVerificationToken");
  }
};
