/* THIS IS COPIED FROM COMMON/MODELS */

module.exports = function (sequelize, DataTypes) {
  const UserReset = sequelize.define('UserReset', {
    id: {
      type: DataTypes.UUID,
      field: 'id',
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    used: {
      type: DataTypes.BOOLEAN,
      field: 'used',
      required: true,
      defaultValue: false,
    },
    expires: {
      field: 'expires',
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate (models) {
        UserReset.belongsTo(models.User, {
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false,
          },
        });
      },
    },
  });

  return UserReset;
};
