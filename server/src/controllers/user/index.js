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
				gw2ApiTokens: ['valid-gw2-token', 'no-white-space']
			}
		}).addResource({
			name: 'users',
			mode: 'update',
			rules: {
				email: 'required',
				currentPassword: ['required'],
				password: ['required', 'password', 'no-white-space']
			}
		});

	/**
	 * Create user resource.
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
					if (!user.gw2ApiTokens) {
						return;
					}

					user.gw2ApiTokens.forEach(function (token) {
						promise.then(function () {
								return gw2Api
									.readAccount(token)
									.then(function (account) {
										var tokenItem = {
											token: token,
											accountName: account.name,
											UserId: e.id
										};

										return addApiToken(tokenItem);
									});
						});
					});
				});
		};

		var addApiToken = function (token) {
			return models
				.Gw2ApiToken
				.create(token);
		};

		var loadInitialCharacters = function (token, userId) {
			// todo: this logic will be duplicated into gw2-ping
			// perhaps it will be beneficial to create an endpoint and ping 
			// it internally instead
		};

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
	 * Read user resource.
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
				// TODO: Bring back all gw2 api tokens.
			})
			.then(function (data) {
				return data.dataValues;
			});
	};

	/**
	 * Update user resource. 
	 * Currently only changing your password is supported.
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