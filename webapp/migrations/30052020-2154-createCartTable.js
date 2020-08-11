'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Cart', {
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
			Quantity: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			Price: {
				type: Sequelize.FLOAT,
				allowNull: false
			},
			Payment_Done: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		});
	},
	down: (queryInterface, Sequelize) => {
			return queryInterface.dropTable('Cart');
	}
};