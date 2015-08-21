var q = require('q');

function UserValidator(userModel) {
	UserValidator.prototype.create = function (user) {
		var errors = [];

		if (!user.email) {
			errors.push('Email is required');
		}
		
		if (!user.alias) {
			errors.push('Alias is required');
		} else if (hasWhiteSpace(users.alias)) {
			errors.push('Alias can\'t have white space');
		}

		if (!user.password) {
			errors.push('Password is required');
		}

		if (errors) {
			return q.reject(errors);
		}

		var defer = q.defer();

		// TODO: Check email is available
		// TODO: Check alias is available
		// TODO: Check token is valid (if passed in)

		return defer.promise;
	}

	UserValidator.prototype.update = function (user) {
		var defer = q.defer();

		return defer.promise;
	}

	UserValidator.prototype.email = function (email) {
		var defer = q.defer();

		models.User
			.findOne({ where: { email: email }})
			.then(function (item) {
				if (item) {
					defer.reject();
				} else {
					defer.resolve();
				}
			});

		return defer.promise;
	}

	UserValidator.prototype.alias = function (alias) {
		var defer = q.defer();

		models.User
			.findOne({ where: { alias: alias }})
			.then(function (item) {
				if (item) {
					defer.reject();
				} else {
					defer.resolve();
				}
			});

		return defer.promise;
	}

	UserValidator.prototype.gw2Token = function (token) {
		var defer = q.defer();

		return defer.promise;
	}

	function hasWhiteSpace(s) {
		return /\s/g.test(s);
	}
}

module.exports = UserValidator;