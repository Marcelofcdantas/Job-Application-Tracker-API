"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "mustChangePassword", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("Users", "temporaryPasswordExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "passwordHistory", {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "failedLoginAttempts", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Users", "lockedUntil", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "mfaCodeHash", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "mfaCodeExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "mustChangePassword");
    await queryInterface.removeColumn("Users", "temporaryPasswordExpiresAt");
    await queryInterface.removeColumn("Users", "passwordHistory");
    await queryInterface.removeColumn("Users", "failedLoginAttempts");
    await queryInterface.removeColumn("Users", "lockedUntil");
    await queryInterface.removeColumn("Users", "mfaCodeHash");
    await queryInterface.removeColumn("Users", "mfaCodeExpiresAt");
  },
};