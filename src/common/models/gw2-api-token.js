/* THIS IS COPIED FROM COMMON/MODELS */

module.exports = function (sequelize, DataTypes) {
  const Gw2ApiToken = sequelize.define('Gw2ApiToken', {
    token: {
      field: 'token',
      type: DataTypes.STRING,
      primaryKey: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_name',
    },
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'permissions',
    },
    world: {
      type: DataTypes.INTEGER,
      field: 'world',
      allowNull: false,
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'account_id',
    },
    primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'primary',
    },
    // ----------- NEW FIELDS -----------
    created: {
      type: DataTypes.STRING,
    },
    access: {
      type: DataTypes.STRING,
    },
    commander: {
      type: DataTypes.BOOLEAN,
    },
    fractalLevel: {
      type: DataTypes.INTEGER,
    },
    dailyAp: {
      type: DataTypes.INTEGER,
    },
    monthlyAp: {
      type: DataTypes.INTEGER,
    },
    wvwRank: {
      type: DataTypes.INTEGER,
    },
  }, {
    classMethods: {
      associate (models) {
        Gw2ApiToken.hasMany(models.Gw2Character, {
          as: 'gw2_characters',
          foreignKey: {
            allowNull: false,
          },
          onDelete: 'CASCADE',
        });

        Gw2ApiToken.belongsTo(models.User, {
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false,
          },
        });
      },
    },
  });

  return Gw2ApiToken;
};
