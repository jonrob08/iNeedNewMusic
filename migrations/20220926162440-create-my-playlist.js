'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('myPlaylists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      trackTitle: {
        type: Sequelize.STRING
      },
      trackArtist: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('myPlaylists');
  }
};