'use strict';

// NOTE: THIS IS A COPIED FILE FROM db-models!

module.exports = function (sequelize, DataTypes) {
  var Gw2Guild = sequelize.define("Gw2Guild", {
    id: {
      field: 'token',
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      field: 'name',
      type: DataTypes.STRING,
      allowNull: false
    },
    tag: {
      field: 'tag',
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Gw2Guild;
};