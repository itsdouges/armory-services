module.exports = function (sequelize, DataTypes) {
  const Gw2ApiToken = sequelize.define('Gw2ApiToken', {
    // REQUIRES MIGRATION (new field, new primary key)
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    token: {
      type: DataTypes.STRING,
      // REQUIRES MIGRATION (primaryKey: false, allowNull false, unique true)
      // primaryKey: true,
      allowNull: false,
      unique: true,
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
    },
    guilds: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created: DataTypes.STRING,
    access: DataTypes.STRING,
    commander: DataTypes.BOOLEAN,
    fractalLevel: DataTypes.INTEGER,
    dailyAp: DataTypes.INTEGER,
    monthlyAp: DataTypes.INTEGER,
    wvwRank: DataTypes.INTEGER,

    // REQUIRES MIGRATION (new field)
    stub: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
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
