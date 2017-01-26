module.exports = function (sequelize, DataTypes) {
  const Gw2Character = sequelize.define('Gw2Character', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      field: 'name',
      type: DataTypes.STRING,
      allowNull: false,
    },
    race: {
      field: 'race',
      allowNull: false,
      type: DataTypes.STRING,
    },
    gender: {
      field: 'gender',
      allowNull: false,
      type: DataTypes.STRING,
    },
    profession: {
      field: 'profession',
      allowNull: false,
      type: DataTypes.STRING,
    },
    level: {
      field: 'level',
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    created: {
      field: 'created',
      allowNull: false,
      type: DataTypes.DATE,
    },
    age: {
      field: 'created',
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    deaths: {
      field: 'deaths',
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    guild: {
      field: 'guild',
      type: DataTypes.STRING,
    },
    showBuilds: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_builds',
    },
    showPvp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_pvp',
    },
    showBags: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_bags',
    },
    showCrafting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_crafting',
    },
    showEquipment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_equipment',
    },
    showPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_public',
    },
    showGuild: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_guild',
    },
  }, {
    classMethods: {
      associate (models) {
        Gw2Character.belongsTo(models.Gw2ApiToken, {
          // field: 'apiTokenId',
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false,
          },
        });
      },
    },
  });

  return Gw2Character;
};
