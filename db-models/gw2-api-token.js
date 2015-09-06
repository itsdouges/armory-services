'use strict';

// NOTE: THIS IS A COPIED FILE FROM db-models!

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
    // todo: save this to db when i can ;-)
    world: {
      type: DataTypes.STRING,
      field: 'world',
      allowNull: false
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'account_id'
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
        Gw2ApiToken.hasMany(models.Gw2Character, { 
          as: 'gw2_characters',
          foreignKey: { 
            allowNull: false 
          }, 
          onDelete: 'CASCADE' 
        });
        
        Gw2ApiToken.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: { 
            allowNull: false 
          }
        });
      }
    }
  });

  return Gw2ApiToken;
};