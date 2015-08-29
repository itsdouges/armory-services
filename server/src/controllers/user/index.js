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
		var defer = q.defer();

		var validator = Validator({
			resource: 'users',
			mode: 'create'
		});

		function createUser(user) {
			models.User
				.create(user)
				.then(function (e) {
					if (user.gw2_api_tokens) {
						user.gw2_api_tokens.forEach(function (token) {
							token.UserId = e.id;
							gw2Api.readAccount(token.token)
								.then(function (account) {
									token.accountName = account.name;
									addToken(token);
								}, function (e) {
									throw e;
								});
						});
					} else {
						defer.resolve();
					}
				}, function (e) {
					throw e;
				});
		}

		function addToken(token) {
			models.Gw2ApiToken.create(token)
				.then(function (e) {
					defer.resolve();
				}, function (e) {
					throw e;
				});
		}

		validator.validate(user)
			.then(function () {
				password(user.password).hash(function (error, hash) {
					if (error) {
						throw error;
					}

					user.passwordHash = hash;

					createUser(user);
				});
			}, defer.reject);

		return defer.promise;
	};

	UsersResource.prototype.update = function (user) {
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

	UsersResource.prototype.sendActivationEmail = function (alias) {
		// TODO: Implement
	};
}

module.exports = UsersResource;