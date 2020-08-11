'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Books', {
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
			ISBN: {
				allowNull: false,
				type: Sequelize.STRING
			},
			Title: {
				allowNull: false,
				type: Sequelize.STRING
			},
			Authors: {
				allowNull: false,
				type: Sequelize.STRING
			},
			Quantity: {
				allowNull: false,
				type: Sequelize.INTEGER
			},
			PublicationDate: {
				allowNull: false,
				type: Sequelize.DATEONLY
			},
			Price: {
				allowNull: false,
				type: Sequelize.FLOAT
			}
		});
	},
	down: (queryInterface, Sequelize) => {
			return queryInterface.dropTable('Books');
	}
};