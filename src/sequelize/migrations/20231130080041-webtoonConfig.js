'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn("webtoon", "id"),

      await queryInterface.addConstraint("webtoon", {
        fields: ["webtoonId"],
        type: "primary key",
        name: "webtoon_webtoonId_key",
      }),

      await queryInterface.renameColumn("webtoon", "webtoonId", "id"),

      queryInterface.removeColumn("webtoon", "embVectorDescription")
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.renameColumn("webtoon", "id", "webtoonId"),
      
      await queryInterface.removeConstraint("webtoon", "webtoon_webtoonId_key"),

      await queryInterface.addColumn("webtoon", "id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      }),

      queryInterface.addColumn("webtoon", "embVectorDescription", {
          type: Sequelize.TEXT, 
          allowNull: true, 
      }),
    ]);
  }
};
