'use strict';

// NOTE: THIS IS A COPIED FILE FROM db-models!

module.exports = function (sequelize, DataTypes) {
  var UserToken = sequelize.define('UserToken', {
		id: {
			type: DataTypes.UUID,
			field: 'id',
			required: true,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		email: {
			type: DataTypes.STRING,
			field: 'email',
			required: true
		},
		token: {
			type: DataTypes.STRING,
			field: 'token',
			required: true
		}
  });

  return UserToken;
};
