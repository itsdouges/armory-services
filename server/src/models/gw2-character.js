'use strict';

module.exports = function(sequelize, DataTypes) {
  var Gw2Character = sequelize.define("Gw2Character", {
  	name: {
  		field: 'name',
  		type: DataTypes.STRING,
      allowNull: false,
  		primaryKey: true
  	},
    race: {
      field: 'race',
      type: DataTypes.STRING
    },
    gender: {
      field: 'gender',
      type: DataTypes.STRING
    },
    profession: {
      field: 'profession',
      type: DataTypes.STRING
    },
    level: {
      field: 'level',
      type: DataTypes.STRING
    },
    guild: {
      field: 'guild',
      type: DataTypes.STRING
    },    
    showBags: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_bags'
    },
    showCrafting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_crafting'
    },
    showEquipment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_equipment'
    },
    showPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_public'
    },
    showGuild: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_guild'
    }
  }, {
    classMethods: {
      associate: function(models) {
        Gw2Character.belongsTo(models.Gw2ApiToken, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return Gw2Character;
};