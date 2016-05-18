'use strict';

// NOTE: THIS IS A COPIED FILE FROM db-models!

module.exports = function (sequelize, DataTypes) {
  var UserReset = sequelize.define('UserReset', {
        id: {
            type: DataTypes.UUID,
            field: 'id',
            required: true,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        used: {
            type: DataTypes.BOOLEAN,
            field: 'used',
            required: true,
            defaultValue: false
        }
  });

  return UserReset;
};