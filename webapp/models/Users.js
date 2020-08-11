module.exports = (sequelize, DataTypes) => {
	var Users= sequelize.define('Users', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull:false,
		},
		password: {
				allowNull: false,
				type: DataTypes.STRING
		},
		firstname: {
				allowNull: false,
				type: DataTypes.STRING
		},
		lastname: {
				allowNull: false,
				type: DataTypes.STRING
		}
	},
	{
 			freezeTableName: true
	}
	);

	Users.associate = models => {
    Users.hasOne(models.Cart, { foreignKey: 'User_id'});
    Users.hasMany(models.Books, { foreignKey: 'Seller_id' });
	};
	return Users;
};