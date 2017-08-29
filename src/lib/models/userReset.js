module.exports = (sequelize, DataTypes) => {
  const UserReset = sequelize.define('UserReset', {
    id: {
      type: DataTypes.UUID,
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    used: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  UserReset.associate = function associate (models) {
    UserReset.belongsTo(models.User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return UserReset;
};
