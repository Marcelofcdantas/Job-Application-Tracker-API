'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("applications", "country", {
    type: Sequelize.STRING,
    allowNull: true,
    });

    await queryInterface.addColumn("applications", "province", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("applications", "city", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("applications", "salary", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("applications", "workMode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("applications", "country");
    await queryInterface.removeColumn("applications", "province");
    await queryInterface.removeColumn("applications", "city");
    await queryInterface.removeColumn("applications", "salary");
    await queryInterface.removeColumn("applications", "workMode");
  }
};
