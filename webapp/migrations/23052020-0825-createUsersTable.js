'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Users', {
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
			email: {
				allowNull: false,
				type: Sequelize.STRING
			},
			password: {
				allowNull: false,
				type: Sequelize.STRING
			},
			firstname: {
				allowNull: false,
				type: Sequelize.STRING
			},
			lastname: {
				allowNull: false,
				type: Sequelize.STRING
			},
		});
	},
	down: (queryInterface, Sequelize) => {
			return queryInterface.dropTable('Users');
	}
};