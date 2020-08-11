module.exports = (sequelize, DataTypes) => {
	var Images= sequelize.define('Images', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		path: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Book_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		key: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
 			freezeTableName: true
	});
	
	Images.associate = models => {
    Images.belongsTo(models.Books, { foreignKey: 'Book_id' });
	};
	return Images;
};