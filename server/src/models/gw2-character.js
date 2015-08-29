'use strict';

module.exports = function(sequelize, DataTypes) {
  var Gw2Character = sequelize.define("Gw2Character", {
  	name: {
  		field: 'name',
  		type: DataTypes.STRING,
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
    }
  }, {
    classMethods: {
      associate: function(models) {
        Gw2Character.belongsTo(models.Gw2ApiToken, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false,
            as: 'token'
          }
        });
      }
    }
  });

  return Gw2Character;
};