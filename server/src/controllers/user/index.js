'use strict';

// todo: use sequelize transactions where appropriate!
var password = require('password-hash-and-salt');
var q = require('q');

function UsersResource(models, Validator, gw2Api) {
	Validator
		.addResource({
			name: 'users',
			mode: 'create',
			rules: {
				email: ['required', 'unique-email', 'no-white-space'],
				password: ['required', 'password', 'no-white-space'],
				gw2_api_tokens: ['valid-gw2-token', 'no-white-space']
			}
		}).addResource({
			name: 'users',
			mode: 'update',
			rules: {
				currentPassword: ['required'],
				password: ['required', 'password', 'no-white-space']
			}
		});

	UsersResource.prototype.create = function (user) {
		var validator = Validator({
			resource: 'users',
			mode: 'create'
		});

		var createUser = function (user) {
			return models.User
				.create(user)
				.then(function (e) {
					if (!user.gw2_api_tokens) {
						return;
					}

					user.gw2_api_tokens.forEach(function (token) {
						promise.then(function () {
								return gw2Api
									.readAccount(token.token)
									.then(function (account) {
										token.accountName = account.name;
										token.UserId = e.id;

										return addApiToken(token);
									});
						});
					});
				});
		};

		var addApiToken = function (token) {
			return models
				.Gw2ApiToken
				.create(token)
				.then(function (e) {
					return;
				});
		}

		var promise = validator.validate(user)
			.then(function () {
				var defer = q.defer();
				
				password(user.password).hash(function (error, hash) {
					if (error) {
						defer.reject(error);
					}

					return defer.resolve(hash);
				});

				return defer.promise;
			})
			.then(function (passwordHash) {
				user.passwordHash = passwordHash;
				return createUser(user);
			});

		return promise;
	};

	UsersResource.prototype.update = function (user) {
		// todo: implement today (sunday!)

		var defer = q.defer();

		var validator = new Validator({
			resource: 'users',
			mode: 'update'
		});

		validator.validate()

		models.User
			.update(user, { where: { alias: user.alias } })
			.then(function (e) {

			}, q.reject);

		var defer = q.defer();
	};
}

module.exports = UsersResource;