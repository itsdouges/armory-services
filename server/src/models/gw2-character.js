'use strict';

module.exports = function(sequelize, DataTypes) {
  var Gw2Character = sequelize.define("Gw2Character", {
  	name: {
  		field: 'name',
  		type: DataTypes.STRING,
  		primaryKey: true
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