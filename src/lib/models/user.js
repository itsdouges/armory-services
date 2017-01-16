module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      field: 'id',
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    alias: {
      type: DataTypes.STRING,
      field: 'alias',
      unique: true,
      required: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      required: true,
      field: 'email',
      // REQUIRES MIGRATION (turning unique off)
      // unique: true,
      allowNull: false,
    },
    passwordHash: {
      /* eslint new-cap:0 */
      type: DataTypes.STRING(500),
      required: true,
      allowNull: false,
      field: 'password_hash',
    },
    emailValidated: {
      type: DataTypes.BOOLEAN,
      field: 'email_validated',
      allowNull: false,
      defaultValue: false,
    },

    // REQUIRES MIGRATION
    stub: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate (models) {
        User.hasMany(models.Gw2ApiToken, {
          as: 'gw2_api_tokens',
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false,
          },
        });
      },
    },
  });

  return User;
};
