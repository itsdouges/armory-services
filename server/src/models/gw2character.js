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
        Gw2Character.belongsTo(models.User, {
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