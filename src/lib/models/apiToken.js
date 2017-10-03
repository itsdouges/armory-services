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
    access: {
      type: DataTypes.STRING,
      allowNull: true,
      get () {
        const access = this.getDataValue('access');
        return access ? access.split(',') : null;
      },
      set (value) {
        this.setDataValue('access', value ? value.join(',') : null);
      },
    },
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
    valid: DataTypes.BOOLEAN,
  });

  Gw2ApiToken.associate = function associate (models) {
    Gw2ApiToken.belongsTo(models.User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });

    Gw2ApiToken.hasMany(models.Gw2Character, {
      as: 'gw2_characters',
      foreignKey: {
        allowNull: false,
        name: 'apiTokenId',
      },
      onDelete: 'CASCADE',
    });
  };

  return Gw2ApiToken;
};
