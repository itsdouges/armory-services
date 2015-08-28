'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
		id: {
			type: DataTypes.UUID,
			field: 'id',
			required: true,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		email: {
			type: DataTypes.STRING,
			required: true,
			field: 'email'
		},
		alias: {
			type: DataTypes.STRING,
			required: true,
			field: 'alias'
		},
		passwordHash: {
			type: DataTypes.STRING(500),
			required: true,
			field: 'password_hash'
		},
		gw2ApiToken: {
			type: DataTypes.STRING,
			field: 'gw2_api_token'
		},
		gw2ApiTokenValid: {
			type: DataTypes.BOOLEAN,
			field: 'gw2_api_token_valid'
		},
		emailValidated: {
			type: DataTypes.BOOLEAN,
			field: 'email_validated',
			allowNull: false,
			defaultValue: false
		},
  }, {
    	classMethods: {
      	associate: function(models) {
        	User.hasMany(models.Gw2Character, { as: 'Gw2Characters' })
      }
    }
  });

  return User;
};
