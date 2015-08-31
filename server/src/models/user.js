'use strict';

// how to add children:
// http://stackoverflow.com/questions/27159759/sequelize-store-an-object-along-with-child-associated-object

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
		id: {
			type: DataTypes.UUID,
			field: 'id',
			required: true,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		alias: {
			type: DataTypes.STRING,
			field: 'alias'
		},
		email: {
			type: DataTypes.STRING,
			required: true,
			field: 'email',
			allowNull: false
		},
		passwordHash: {
			type: DataTypes.STRING(500),
			required: true,
			allowNull: false,
			field: 'password_hash'
		},
		emailValidated: {
			type: DataTypes.BOOLEAN,
			field: 'email_validated',
			allowNull: false,
			defaultValue: false
		}
  }, {
    	classMethods: {
      	associate: function(models) {
        	User.hasMany(models.Gw2ApiToken, { 
        		as: 'gw2_api_tokens'
        	});
      }
    }
  });

  return User;
};
