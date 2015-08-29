'use strict';

module.exports = function(sequelize, DataTypes) {
  var Gw2ApiToken = sequelize.define("Gw2ApiToken", {
    token: {
  		field: 'token',
  		type: DataTypes.STRING,
  		primaryKey: true,
  	},
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_name'
    },
    valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // expectation is that only valid tokens can be added, that can then become invalid.
      defaultValue: true,
      field: 'valid'
    },
  }, {
    classMethods: {
      associate: function(models) {
        Gw2ApiToken.hasMany(models.Gw2Character, { as: 'gw2_characters' });
        Gw2ApiToken.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false,
            as: 'user_id'
          }
        });
      }
    }
  });

  return Gw2ApiToken;
};