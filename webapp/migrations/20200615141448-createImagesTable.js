'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull:false,
        type: Sequelize.DATE
      },
      path: {
        allowNull:false,
        type: Sequelize.STRING
      },
      key: {
      type: Sequelize.STRING,
      allowNull: false
    }
    });
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Images');
  }
};