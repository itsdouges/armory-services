'use strict';

var password = require('password-hash-and-salt');
var q = require('q');

function UsersResource(models, validator) {
	// TODO: Email confirmation.
	// TODO: Forgot my password.

	UsersResource.prototype.create = function (user) {
		// TODO: change to promise based validation
		var errors = validator.create(user);
		if (errors) {
			return q.reject(errors);
		}

		var defer = q.defer();

		password(user.password).hash(function (error, hash) {
			if (error) {
				defer.reject(error);
			}

			user.passwordHash = hash;

			models.User
				.create(user)
				.then(defer.resolve, defer.reject);
		});

		return defer.promise;
	};

	UsersResource.prototype.update = function (user) {
		// TODO: change to promise based validation
		var errors = validator.update(user);
		if (errors) {
			return q.reject(errors);
		}

		models.User
			.update(user, { where: { alias: user.alias } })
			.then(function (e) {

			}, q.reject);

		var defer = q.defer();
	};

	UsersResource.prototype.updateGw2Token = function (alias, token) {
		var defer = q.defer();

		validator
			.gw2Token(token)
			.then(function () {
				// TODO: Implement update
			}, defer.reject);
		
		return defer.promise;
	};

	UsersResource.prototype.sendActivationEmail = function (alias) {
		// TODO: Implement
	};
}

module.exports = UsersResource;