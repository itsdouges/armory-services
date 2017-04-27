module.exports = (sequelize, DataTypes) => {
  const Gw2ApiToken = sequelize.define('Gw2ApiToken', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
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
    stub: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    invalid: DataTypes.BOOLEAN,
  }, {
    classMethods: {
      associate (models) {
        Gw2ApiToken.hasMany(models.Gw2Character, {
          // as: 'characters',
          as: 'gw2_characters',
          foreignKey: {
            allowNull: false,
            name: 'apiTokenId',
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
