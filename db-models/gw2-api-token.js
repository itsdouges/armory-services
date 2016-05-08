'use strict';

// NOTE: THIS IS A COPIED FILE FROM db-models!

module.exports = function (sequelize, DataTypes) {
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
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'permissions'
    },
    world: {
      type: DataTypes.INTEGER,
      field: 'world',
      allowNull: false
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'account_id'
    },
    primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'primary'
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