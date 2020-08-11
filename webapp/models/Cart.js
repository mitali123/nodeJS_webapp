module.exports = (sequelize, DataTypes) => {
	var Cart= sequelize.define('Cart', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		User_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		Book_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		Quantity: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		Price: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		Payment_Done: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
 			freezeTableName: true
	});
	
	Cart.associate = models => {
    Cart.belongsTo(models.Users, { foreignKey: 'User_id'});
    Cart.belongsTo(models.Books, { foreignKey: 'Book_id' });
	};
	return Cart;
};