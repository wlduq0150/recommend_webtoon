'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      // 1. userId -> email로 변경
      queryInterface.renameColumn("user", "userId", "email"),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("user", "email", "userId"),
    ]);
  }
};
