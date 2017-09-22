module.exports = (sequelize, DataTypes) => {
  const Gw2Character = sequelize.define('Gw2Character', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    race: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    gender: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    profession: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    level: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    created: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    age: {
      field: 'created',
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    deaths: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    guild: {
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
    privacy: DataTypes.STRING,
    images: {
      type: DataTypes.LONGTEXT,
      get () {
        const images = this.getDataValue('images');
        if (images) {
          return JSON.parse(images);
        }

        return null;
      },
      set (val) {
        if (val) {
          this.setDataValue('images', JSON.stringify(val));
        }
      },
    },
    portrait: DataTypes.STRING,
  });

  Gw2Character.associate = function associate (models) {
    Gw2Character.belongsTo(models.Gw2ApiToken, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'apiTokenId',
        allowNull: false,
      },
    });
  };

  return Gw2Character;
};
