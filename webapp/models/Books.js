module.exports = (sequelize, DataTypes) => {
	var Books= sequelize.define('Books', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		ISBN: {
			type: DataTypes.STRING,
			allowNull:false,
		},
		Title: {
				allowNull: false,
				type: DataTypes.STRING
		},
		Authors: {
				allowNull: false,
				type: DataTypes.STRING
		},
		PublicationDate: {
				allowNull: false,
				type: DataTypes.DATEONLY
		},
		Price: {
				allowNull: false,
				type: DataTypes.FLOAT
		},
		Quantity: {
				allowNull: false,
				type: DataTypes.INTEGER
		},
		Seller_id: {
				allowNull: false,
				type: DataTypes.INTEGER
		}
	},
	{
 			freezeTableName: true
	}
	);

	Books.associate = models => {
    Books.belongsTo(models.Users, { foreignKey: 'Seller_id' });
    Books.hasMany(models.Cart, { foreignKey: 'Book_id'});
    Books.hasMany(models.Images, { foreignKey: 'Book_id'});
  };
	return Books;
};