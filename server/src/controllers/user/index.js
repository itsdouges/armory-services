'use strict';

// todo: use sequelize transactions where appropriate!
var password = require('password-hash-and-salt');
var q = require('q');

function UsersResource(models, Validator, gw2Api) {
	var scope = this;

	// move to helper?
	var hashPassword = function (userPass) {
		var defer = q.defer();
						
		password(userPass).hash(function (error, hash) {
			if (error) {
				defer.reject(error);
			}

			return defer.resolve(hash);
		});

		return defer.promise;
	};

	// move to helper?
	var verifyHash = function (hash, userPassword) {
		var defer = q.defer();

		password(userPassword).verifyAgainst(hash, function (error, verified) {
			if (error) {
				return defer.reject(error);
			}

			if (!verified) {
				return defer.reject('Bad password');
			}

			return defer.resolve();
		});

		return defer.promise;
	};

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
				id: 'required',
				currentPassword: ['required'],
				password: ['required', 'password', 'no-white-space']
			}
		});

	/**
	 * Create user item.
	 * Email and password are required, gw2 api tokens are optional.
	 */
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
				return hashPassword(user.password);
			})
			.then(function (passwordHash) {
				user.passwordHash = passwordHash;
				return createUser(user);
			});

		return promise;
	};

	/**
	 * Read
	 * Finding by email as that is what the user will be using for their
	 * login credentials.
	 */
	UsersResource.prototype.read = function (email) {
		return models
			.User
			.findOne({
				where: {
					email: email
				}
			})
			.then(function (data) {
				return data.dataValues;
			});
	};

	/**
	 * Update
	 * Update user resource. Currently only changing your password is supported.
	 */
	UsersResource.prototype.update = function (user) {
		var validator = Validator({
			resource: 'users',
			mode: 'update'
		});

		var promise = validator
			.validate(user)
			.then(function () {
				return scope.read(user.email);
			})
			.then(function (userData) {
				return verifyHash(userData.passwordHash, user.currentPassword)
					.then(function () {
						return user.password;
					});
			})
			.then(function (newPassword) {
				return hashPassword(newPassword);
			})
			.then(function (newHash) {
				user.passwordHash = newHash;
								
				return models.User.update({
					passwordHash: newHash
				}, {
					where: {
						email: user.email
					}
				});
			});

		return promise;
	};
}

module.exports = UsersResource;